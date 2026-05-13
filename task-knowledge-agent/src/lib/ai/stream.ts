const decoder = new TextDecoder();
const encoder = new TextEncoder();

type StreamTextOptions = {
  onToken?: (token: string) => void;
};

export function streamPlainText(
  stream: ReadableStream<Uint8Array>,
  options: StreamTextOptions = {},
) {
  const reader = stream.getReader();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await reader.read();

      if (done) {
        controller.close();
        return;
      }

      const token = decoder.decode(value, { stream: true });
      options.onToken?.(token);
      controller.enqueue(value);
    },
  });
}

export function streamOpenAISseAsText(
  stream: ReadableStream<Uint8Array>,
  options: StreamTextOptions = {},
) {
  const reader = stream.getReader();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const separatorIndex = buffer.indexOf("\n\n");

        if (separatorIndex >= 0) {
          const rawEvent = buffer.slice(0, separatorIndex);
          buffer = buffer.slice(separatorIndex + 2);
          const token = parseSseToken(rawEvent);

          if (token) {
            options.onToken?.(token);
            controller.enqueue(encoder.encode(token));
            return;
          }

          continue;
        }

        const { value, done } = await reader.read();

        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
      }
    },
  });
}

function parseSseToken(rawEvent: string) {
  const dataLines = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim());

  for (const data of dataLines) {
    if (!data || data === "[DONE]") {
      continue;
    }

    try {
      const parsed = JSON.parse(data) as {
        choices?: Array<{ delta?: { content?: string } }>;
      };

      const token = parsed.choices?.[0]?.delta?.content;

      if (token) {
        return token;
      }
    } catch {
      continue;
    }
  }

  return "";
}
