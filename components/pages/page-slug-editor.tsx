"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSlugErrorMessage, usePageMutations } from "@/hooks/use-pages";
import type { Page } from "@/types/api";

function isValidSlug(slug: string): boolean {
  const trimmed = slug.trim();
  return trimmed.length > 0 && trimmed.startsWith("/");
}

export function PageSlugEditor({
  page,
  pageId,
  siteId,
}: {
  page: Page;
  pageId: string;
  siteId: string;
}) {
  const { updateSlug } = usePageMutations(pageId, siteId);
  const [slug, setSlug] = useState(page.slug);
  const [notifyFrontend, setNotifyFrontend] = useState(true);

  useEffect(() => {
    setSlug(page.slug);
  }, [page.slug]);

  const isPublished = page.status === "PUBLISHED";
  const isSaving = updateSlug.isPending;
  const trimmed = slug.trim();
  const isDirty = trimmed !== page.slug;
  const canSave = isValidSlug(slug) && isDirty && !isSaving;

  async function handleSave() {
    if (!trimmed) {
      toast.error("Slug cannot be empty");
      return;
    }
    if (!trimmed.startsWith("/")) {
      toast.error("Slug must start with /");
      return;
    }

    try {
      const result = await updateSlug.mutateAsync({
        slug: trimmed,
        ...(isPublished && { republish: notifyFrontend }),
      });

      if (!result.changed) {
        toast.info("Slug unchanged");
        return;
      }

      const parts = [`URL updated to ${result.slug}`];
      if (result.republished && result.webhookFired) {
        parts.push("live site updated via webhook");
      } else if (result.republished) {
        parts.push("republish queued");
      }
      toast.success(parts.join(" — "));
    } catch (e) {
      toast.error(getSlugErrorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">URL path</CardTitle>
          <p className="text-sm text-muted-foreground">
            The public path for this page on the live site.
          </p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={!canSave}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="page-slug">Slug</Label>
          <Input
            id="page-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="/guides/example"
            spellCheck={false}
          />
          {slug.trim() && !slug.trim().startsWith("/") && (
            <p className="text-xs text-destructive">Slug must start with /</p>
          )}
        </div>

        {isPublished && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-muted-foreground">
                This page is published. Changing the URL may break existing
                links — set up redirects on the frontend or CDN if the old path
                is still in use.
              </p>
            </div>
          </div>
        )}

        {isPublished && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="notify-frontend"
              checked={notifyFrontend}
              onCheckedChange={(checked) =>
                setNotifyFrontend(checked === true)
              }
            />
            <Label htmlFor="notify-frontend" className="text-sm font-normal">
              Notify frontend
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
