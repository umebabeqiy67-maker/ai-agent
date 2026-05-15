export const CHUNK_SIZE = 900;
export const CHUNK_OVERLAP = 120;

export function chunkText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length);
    chunks.push(normalized.slice(start, end).trim());

    if (end === normalized.length) {
      break;
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
}

export function tokenize(text: string) {
  const lower = text.toLowerCase();
  const asciiTokens = lower.match(/[a-z0-9_-]+/g) ?? [];
  const chineseTokens = Array.from(lower.matchAll(/[\u4e00-\u9fff]{2,}/g))
    .map((match) => match[0])
    .flatMap((word) => {
      const tokens = [word];

      for (let index = 0; index < word.length - 1; index += 1) {
        tokens.push(word.slice(index, index + 2));
      }

      return tokens;
    });

  return Array.from(new Set([...asciiTokens, ...chineseTokens]));
}

export function scoreChunk(
  queryTokens: string[],
  chunkTokens: string[],
  content: string,
  query: string,
) {
  const tokenSet = new Set(chunkTokens);
  let score = 0;

  for (const token of queryTokens) {
    if (tokenSet.has(token)) {
      score += token.length > 2 ? 3 : 1;
    }
  }

  if (content.includes(query)) {
    score += 10;
  }

  return score;
}
