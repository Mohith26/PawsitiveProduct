"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgentConfig {
  id: string;
  agent_type: string;
  display_name: string;
  system_prompt: string;
  model_id: string;
  max_tokens: number;
  temperature: number;
}

export default function AdminAgentsPage() {
  const supabase = createClient();
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("agent_config").select("*");
      setConfigs((data as unknown as AgentConfig[]) ?? []);
    };
    fetch();
  }, [supabase]);

  const saveConfig = async (config: AgentConfig) => {
    setSaving((prev) => ({ ...prev, [config.id]: true }));
    await supabase
      .from("agent_config")
      .update({
        display_name: config.display_name,
        system_prompt: config.system_prompt,
        model_id: config.model_id,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", config.id);
    setSaving((prev) => ({ ...prev, [config.id]: false }));
  };

  const updateConfig = (id: string, field: string, value: unknown) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agent Configuration</h1>
      <p className="text-muted-foreground">Configure AI agent behavior and parameters.</p>

      {configs.map((config) => (
        <Card key={config.id}>
          <CardHeader>
            <CardTitle>{config.display_name} ({config.agent_type})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={config.display_name} onChange={(e) => updateConfig(config.id, "display_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea value={config.system_prompt} onChange={(e) => updateConfig(config.id, "system_prompt", e.target.value)} rows={6} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Model ID</Label>
                <Input value={config.model_id} onChange={(e) => updateConfig(config.id, "model_id", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input type="number" value={config.max_tokens} onChange={(e) => updateConfig(config.id, "max_tokens", parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Input type="number" step="0.1" min="0" max="1" value={config.temperature} onChange={(e) => updateConfig(config.id, "temperature", parseFloat(e.target.value))} />
              </div>
            </div>
            <Button onClick={() => saveConfig(config)} disabled={saving[config.id]}>
              {saving[config.id] ? "Saving..." : "Save Configuration"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
