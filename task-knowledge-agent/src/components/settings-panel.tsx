"use client";

import { useState } from "react";
import { KeyRound, Save, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export function SettingsPanel() {
  const [provider, setProvider] = useState("deepseek");
  const [model, setModel] = useState("deepseek-chat");
  const [apiKey, setApiKey] = useState("");
  const [maxToolSteps, setMaxToolSteps] = useState(6);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [ragTopK, setRagTopK] = useState(5);
  const [temperature, setTemperature] = useState(0.7);

  return (
    <div className="grid gap-5 p-6 xl:grid-cols-2">
      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <KeyRound className="h-4 w-4 text-[#7dd3c7]" />
            Provider
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs text-[#a8adba]">Provider</label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="rounded-xl border-white/10 bg-white/[.045] text-[#f3f0e8]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="openai-compatible">
                  OpenAI-compatible
                </SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-[#a8adba]">Model</label>
            <Input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="rounded-xl border-white/10 bg-white/[.045] text-[#f3f0e8]"
              placeholder="deepseek-chat"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-[#a8adba]">API Key</label>
            <Input
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              type="password"
              className="rounded-xl border-white/10 bg-white/[.045] text-[#f3f0e8]"
              placeholder="DEEPSEEK_API_KEY"
            />
            <p className="text-xs leading-5 text-[#777f90]">
              现在只是前端设置草稿。正式版本应该保存到后端环境变量或加密配置，不要把
              API Key 暴露给浏览器。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[provider, model, apiKey ? "Key entered" : "No key"].map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="rounded-full border-white/10 text-[#a8adba]"
              >
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-[#b8a1ff]" />
            Agent Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 text-sm text-[#a8adba]">
          <ControlSlider
            label="Max tool steps"
            value={maxToolSteps}
            min={1}
            max={12}
            step={1}
            onChange={setMaxToolSteps}
          />

          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[.045] p-3">
            <div>
              <div className="text-[#f3f0e8]">Require confirmation for writes</div>
              <p className="mt-1 text-xs text-[#777f90]">
                创建任务、修改数据、发送消息前是否需要用户确认。
              </p>
            </div>
            <Switch
              checked={requireConfirmation}
              onCheckedChange={setRequireConfirmation}
            />
          </div>

          <ControlSlider
            label="RAG top-k"
            value={ragTopK}
            min={1}
            max={12}
            step={1}
            onChange={setRagTopK}
          />

          <ControlSlider
            label="Temperature"
            value={temperature}
            min={0}
            max={1}
            step={0.1}
            onChange={setTemperature}
          />

          <Button className="rounded-[14px] bg-gradient-to-br from-[#7dd3c7] to-[#d9f99d] font-bold text-[#111318] hover:brightness-105">
            <Save className="h-4 w-4" />
            保存设置
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: Readonly<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}>) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.045] p-3">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-[#f3f0e8]">{label}</span>
        <Badge variant="outline" className="rounded-full border-white/10">
          {value}
        </Badge>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([nextValue]) => onChange(nextValue)}
      />
    </div>
  );
}
