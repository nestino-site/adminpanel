"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/use-site-config";
import { useEffect, useState } from "react";

export function SiteConfigForm({ siteId }: { siteId: string }) {
  const { data: config, isLoading } = useSiteConfig(siteId);
  const updateConfig = useUpdateSiteConfig(siteId);
  const [runtime, setRuntime] = useState({
    enableAnalysis: true,
    enableRewrite: true,
    enableImageGeneration: false,
    enableSeoCheck: true,
    maxRetries: 3,
    qualityThreshold: 0.7,
  });

  useEffect(() => {
    if (config?.runtimeConfig) {
      setRuntime((r) => ({ ...r, ...config.runtimeConfig }));
    }
  }, [config]);

  async function handleSave() {
    try {
      await updateConfig.mutateAsync({ runtimeConfig: runtime });
      toast.success("Site config saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  if (isLoading) return <p className="text-muted-foreground">Loading config…</p>;

  const toggles = [
    { key: "enableAnalysis" as const, label: "Enable analysis" },
    { key: "enableRewrite" as const, label: "Enable rewrite" },
    { key: "enableImageGeneration" as const, label: "Enable image generation" },
    { key: "enableSeoCheck" as const, label: "Enable SEO check" },
  ];

  return (
    <div className="max-w-xl space-y-6">
      {toggles.map((t) => (
        <div
          key={t.key}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <Label>{t.label}</Label>
          <Switch
            checked={runtime[t.key]}
            onCheckedChange={(v) => setRuntime({ ...runtime, [t.key]: v })}
          />
        </div>
      ))}

      <div className="space-y-2">
        <Label>Max retries</Label>
        <Input
          type="number"
          min={0}
          max={10}
          value={runtime.maxRetries}
          onChange={(e) =>
            setRuntime({ ...runtime, maxRetries: Number(e.target.value) })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Quality threshold (0–1)</Label>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={runtime.qualityThreshold}
          onChange={(e) =>
            setRuntime({
              ...runtime,
              qualityThreshold: Number(e.target.value),
            })
          }
        />
      </div>

      <Button onClick={handleSave} disabled={updateConfig.isPending}>
        {updateConfig.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save pipeline config
      </Button>
    </div>
  );
}
