"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ImageIcon, Loader2, RefreshCw, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownPreview } from "@/components/pages/markdown-preview";
import { PipelineStepper } from "@/components/pages/pipeline-stepper";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  usePage,
  usePageLogs,
  usePageMutations,
  usePagePreview,
} from "@/hooks/use-pages";
import {
  canRetryImageGeneration,
  isPipelineRunning,
  pageHasContent,
  pageHasHeroImage,
} from "@/lib/page-pipeline";

export default function PageDetailPage() {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();
  const { data: page, isLoading } = usePage(pageId);
  const { data: preview } = usePagePreview(pageId, siteId);
  const { data: logs } = usePageLogs(pageId, siteId);
  const { generate, publish, retryImageGeneration } = usePageMutations(pageId);
  const [retryImageOpen, setRetryImageOpen] = useState(false);

  const content =
    page?.finalContent ??
    page?.rawDraft ??
    preview?.finalContent ??
    preview?.draft;
  const hasContent = page ? pageHasContent(page) : !!content;
  const pipelineRunning = page ? isPipelineRunning(page.pipelineStatus) : false;
  const showRetryImage = page ? canRetryImageGeneration(page) : false;

  async function handlePublish() {
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

  async function handleRetryImage() {
    try {
      await retryImageGeneration.mutateAsync();
      setRetryImageOpen(false);
      toast.success("Image generation retry queued");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Image retry failed");
    }
  }

  if (isLoading || !page) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading page…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={page.title}
        description={page.slug}
        action={
          <div className="flex flex-wrap gap-2">
            {!hasContent && (
              <Button
                variant="outline"
                onClick={() =>
                  generate.mutate(false, {
                    onSuccess: () => toast.success("Content generation started"),
                    onError: (e) => toast.error(e.message),
                  })
                }
                disabled={generate.isPending || pipelineRunning}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate content
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() =>
                generate.mutate(true, {
                  onSuccess: () => toast.success("Regeneration started"),
                  onError: (e) => toast.error(e.message),
                })
              }
              disabled={generate.isPending || pipelineRunning}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate all
            </Button>
            {showRetryImage && (
              <Button
                variant="outline"
                onClick={() => setRetryImageOpen(true)}
                disabled={retryImageGeneration.isPending || pipelineRunning}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Retry image generation
              </Button>
            )}
            <Button
              onClick={handlePublish}
              disabled={
                publish.isPending || page.pipelineStatus !== "READY"
              }
            >
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        }
      />

      {!hasContent && !pipelineRunning && (
        <p className="mb-4 text-sm text-muted-foreground">
          No generated content yet — use Generate content to start the pipeline.
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={page.pipelineStatus} kind="pipeline" />
        <StatusBadge status={page.status} kind="page" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {page.pipelineStatus === "PARTIALLY_COMPLETED" && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              Content generated, but image step failed. You can retry image
              generation.
            </div>
          )}
          <PipelineStepper status={page.pipelineStatus} />
          {page.errorLog && (
            <pre className="mt-4 rounded bg-destructive/10 p-3 text-xs text-destructive">
              {page.errorLog}
            </pre>
          )}
        </CardContent>
      </Card>

      {pageHasHeroImage(page) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Hero image</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                page.generatedImageCdnUrl ??
                `data:image/png;base64,${page.generatedImageBase64}`
              }
              alt={`Hero for ${page.title}`}
              className="max-h-64 rounded-lg border object-cover"
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="meta">Meta</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <MarkdownPreview content={content} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="meta" className="mt-4">
          <Card>
            <CardContent className="space-y-2 pt-6 text-sm">
              <p>
                <span className="text-muted-foreground">Meta:</span>{" "}
                {page.metaDescription ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">SEO score:</span>{" "}
                {page.seoScore ?? preview?.analysis?.seoScore ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">GEO score:</span>{" "}
                {page.geoScore ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Model:</span>{" "}
                {preview?.meta?.modelUsed ?? "—"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {!logs ? (
                <p className="text-sm text-muted-foreground">
                  Store site API key to view AI logs, or logs unavailable.
                </p>
              ) : (
                <pre className="max-h-96 overflow-auto text-xs">
                  {JSON.stringify(logs, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={retryImageOpen} onOpenChange={setRetryImageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retry hero image generation?</DialogTitle>
            <DialogDescription>
              Article text will not be regenerated.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setRetryImageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRetryImage}
              disabled={retryImageGeneration.isPending}
            >
              {retryImageGeneration.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Queuing…
                </>
              ) : (
                "Retry image"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
