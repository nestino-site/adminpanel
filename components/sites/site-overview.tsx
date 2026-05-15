"use client";

import { useState } from "react";
import { Copy, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRotateApiKey, useSite, useUpdateSite } from "@/hooks/use-sites";
import { useAuthStore } from "@/lib/store";
import type { Site } from "@/types/api";

export function SiteOverview({ siteId }: { siteId: string }) {
  const { data: site, isLoading } = useSite(siteId);
  const updateSite = useUpdateSite(siteId);
  const rotateKey = useRotateApiKey(siteId);
  const setSiteApiKey = useAuthStore((s) => s.setSiteApiKey);
  const [form, setForm] = useState<Partial<Site>>({});
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyDialog, setKeyDialog] = useState(false);

  if (isLoading || !site) {
    return <p className="text-muted-foreground">Loading site…</p>;
  }

  const values = { ...site, ...form };

  async function handleSave() {
    try {
      await updateSite.mutateAsync({
        name: values.name,
        domain: values.domain,
        autoPublish: values.autoPublish,
        publishWebhookUrl: values.publishWebhookUrl,
      });
      toast.success("Site updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handleRotate() {
    if (!confirm("Rotate content API key? The old key will stop working.")) return;
    try {
      const res = await rotateKey.mutateAsync();
      setNewKey(res.contentApiKey);
      setSiteApiKey(siteId, res.contentApiKey);
      setKeyDialog(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Rotate failed");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={values.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Domain</Label>
          <Input
            value={values.domain ?? ""}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Publish webhook URL</Label>
          <Input
            value={values.publishWebhookUrl ?? ""}
            onChange={(e) =>
              setForm({ ...form, publishWebhookUrl: e.target.value })
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
          <Label>Auto publish</Label>
          <Switch
            checked={values.autoPublish ?? false}
            onCheckedChange={(v) => setForm({ ...form, autoPublish: v })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updateSite.isPending}>
          {updateSite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
        <Button variant="outline" onClick={handleRotate} disabled={rotateKey.isPending}>
          <KeyRound className="mr-2 h-4 w-4" />
          Rotate API key
        </Button>
      </div>

      <Dialog open={keyDialog} onOpenChange={setKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New content API key</DialogTitle>
            <DialogDescription>Copy now — shown once.</DialogDescription>
          </DialogHeader>
          {newKey && (
            <>
              <code className="block break-all rounded border p-3 text-xs">{newKey}</code>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                  toast.success("Copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
