"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateSite } from "@/hooks/use-sites";
import { useAuthStore } from "@/lib/store";

export function CreateSiteWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(1);
  const [savedKey, setSavedKey] = useState(false);
  const [contentApiKey, setContentApiKey] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    domain: "",
    defaultLanguage: "en",
    languages: "en",
    publishWebhookUrl: "",
    publishWebhookSecret: "",
    autoPublish: false,
  });
  const createSite = useCreateSite();
  const { setSiteApiKey, setActiveSiteId } = useAuthStore();

  function reset() {
    setStep(1);
    setSavedKey(false);
    setContentApiKey(null);
    setForm({
      name: "",
      domain: "",
      defaultLanguage: "en",
      languages: "en",
      publishWebhookUrl: "",
      publishWebhookSecret: "",
      autoPublish: false,
    });
  }

  async function handleCreate() {
    try {
      const res = await createSite.mutateAsync({
        name: form.name,
        domain: form.domain,
        defaultLanguage: form.defaultLanguage,
        languages: form.languages.split(",").map((l) => l.trim()),
        publishWebhookUrl: form.publishWebhookUrl || undefined,
        publishWebhookSecret: form.publishWebhookSecret || undefined,
        autoPublish: form.autoPublish,
      });
      setContentApiKey(res.contentApiKey);
      setSiteApiKey(res.site.id, res.contentApiKey);
      setActiveSiteId(res.site.id);
      setStep(3);
      toast.success("Site created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create site");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create site — Step {step} of 3</DialogTitle>
          <DialogDescription>
            {step === 1 && "Basic site information"}
            {step === 2 && "Publishing & webhooks"}
            {step === 3 && "Save your content API key (shown once)"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Input
                placeholder="example.com"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Languages (comma-separated)</Label>
              <Input
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!form.name || !form.domain}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Publish webhook URL</Label>
              <Input
                value={form.publishWebhookUrl}
                onChange={(e) =>
                  setForm({ ...form, publishWebhookUrl: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Webhook secret</Label>
              <Input
                type="password"
                value={form.publishWebhookSecret}
                onChange={(e) =>
                  setForm({ ...form, publishWebhookSecret: e.target.value })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label>Auto publish when ready</Label>
              <Switch
                checked={form.autoPublish}
                onCheckedChange={(v) => setForm({ ...form, autoPublish: v })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={createSite.isPending}
              >
                {createSite.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create site
              </Button>
            </div>
          </div>
        )}

        {step === 3 && contentApiKey && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Copy your content API key now — it will not be shown again.
              </p>
              <code className="mt-2 block break-all rounded bg-background p-3 text-xs">
                {contentApiKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(contentApiKey);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy key
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="saved"
                checked={savedKey}
                onCheckedChange={(v) => setSavedKey(!!v)}
              />
              <Label htmlFor="saved">I have saved this key securely</Label>
            </div>
            <Button
              className="w-full"
              disabled={!savedKey}
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Continue to site config
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
