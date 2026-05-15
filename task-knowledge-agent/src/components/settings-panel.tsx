"use client";

import { useState } from "react";
import { Database, Save, SlidersHorizontal } from "lucide-react";

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
  const [maxToolSteps, setMaxToolSteps] = useState(6);
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [ragTopK, setRagTopK] = useState(5);
  const [temperature, setTemperature] = useState(0.7);

  return (
    <div className="grid gap-5 p-6 xl:grid-cols-2">
      <Card className="rounded-[20px] border-white/10 bg-white/[.055] text-[#f3f0e8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4 text-[#7dd3c7]" />
            Runtime Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 text-sm text-[#a8adba]">
            <div className="rounded-xl border border-white/10 bg-white/[.045] p-3">
              <div className="text-[#f3f0e8]">STORAGE_MODE</div>
              <p className="mt-1 text-xs text-[#777f90]">
                正式环境使用 <code>postgres</code>，测试时才显式使用{" "}
                <code>local</code>。
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.045] p-3">
              <div className="text-[#f3f0e8]">DATABASE_URL</div>
              <p className="mt-1 text-xs text-[#777f90]">
                填 Supabase Postgres connection string，不是项目首页的
                https URL。
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.045] p-3">
              <div className="text-[#f3f0e8]">DEEPSEEK_API_KEY</div>
              <p className="mt-1 text-xs text-[#777f90]">
                只放在 <code>.env.local</code> 或 Vercel Environment
                Variables，不在前端页面输入。
              </p>
            </div>
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
