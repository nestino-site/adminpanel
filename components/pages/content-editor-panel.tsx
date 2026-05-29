"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { MarkdownPreview } from "@/components/pages/markdown-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePageMutations } from "@/hooks/use-pages";
import { ApiRequestError } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Page } from "@/types/api";

function getSaveErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.statusCode === 422) {
      return "Content cannot be empty — add Markdown before saving.";
    }
    if (error.statusCode === 404) {
      return "Page not found.";
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Save failed";
}

export function ContentEditorPanel({
  page,
  pageId,
}: {
  page: Page;
  pageId: string;
}) {
  const { updateContent, publish } = usePageMutations(pageId);
  const [markdown, setMarkdown] = useState(page.finalContent ?? "");
  const [wordCount, setWordCount] = useState(page.wordCount);
  const [republishOpen, setRepublishOpen] = useState(false);

  useEffect(() => {
    setMarkdown(page.finalContent ?? "");
    setWordCount(page.wordCount);
  }, [page.finalContent, page.wordCount]);

  const isPublished = page.status === "PUBLISHED";
  const isSaving = updateContent.isPending;
  const isDirty = markdown !== (page.finalContent ?? "");

  if (!page.finalContent?.trim()) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No content yet — run Generate Content first.
          </p>
        </CardContent>
      </Card>
    );
  }

  async function saveContent(republish: boolean) {
    const trimmed = markdown.trim();
    if (!trimmed) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      const result = await updateContent.mutateAsync({
        finalContent: trimmed,
        republish,
      });
      setWordCount(result.wordCount);
      setRepublishOpen(false);

      const parts = [`Saved (${result.wordCount.toLocaleString()} words)`];
      if (result.republished && result.webhookFired) {
        parts.push("live site updated via webhook");
      } else if (result.republished) {
        parts.push("republish queued");
      }
      toast.success(parts.join(" — "));
    } catch (e) {
      toast.error(getSaveErrorMessage(e));
    }
  }

  async function handlePublishDraft() {
    try {
      const result = await publish.mutateAsync();
      if (result.published) {
        toast.success(
          result.webhookFired
            ? `Published (webhook ${result.webhookStatus})`
            : "Published",
        );
      } else {
        toast.warning(result.skippedReason ?? "Publish skipped");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-base">Content editor</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{page.slug}</span>
              <StatusBadge status={page.status} kind="page" />
              <StatusBadge status={page.pipelineStatus} kind="pipeline" />
              {wordCount != null && (
                <span>{wordCount.toLocaleString()} words</span>
              )}
              {isDirty && (
                <span className="text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveContent(false)}
              disabled={isSaving || !markdown.trim()}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save draft
            </Button>
            {isPublished ? (
              <Button
                size="sm"
                onClick={() => setRepublishOpen(true)}
                disabled={isSaving || !markdown.trim()}
              >
                Save &amp; publish live
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handlePublishDraft}
                disabled={
                  publish.isPending ||
                  page.pipelineStatus !== "READY" ||
                  isDirty
                }
                title={
                  isDirty
                    ? "Save draft before publishing"
                    : page.pipelineStatus !== "READY"
                      ? "Page must be Ready to publish"
                      : undefined
                }
              >
                {publish.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publish
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Markdown
              </p>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-[420px] font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Preview
              </p>
              <div className="max-h-[420px] min-h-[420px] overflow-auto rounded-md border bg-muted/20 p-4">
                <MarkdownPreview content={markdown} />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Saves update stored Markdown and HTML render only — the AI pipeline
            is not re-run.
          </p>
        </CardContent>
      </Card>

      <Dialog open={republishOpen} onOpenChange={setRepublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save and publish live?</DialogTitle>
            <DialogDescription>
              This updates the stored content and pushes changes to the live
              site via webhook. The article will be re-rendered on medcover.io.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setRepublishOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveContent(true)}
              disabled={isSaving || !markdown.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save & publish live"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
