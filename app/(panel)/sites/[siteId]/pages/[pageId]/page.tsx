"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import {
  ContentAuditPanel,
  type ContentAuditPanelHandle,
} from "@/components/pages/content-audit-panel";
import { PipelineStepper } from "@/components/pages/pipeline-stepper";
import { YmylAuditBadge } from "@/components/pages/audit-badges";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  usePage,
  usePageLogs,
  usePageMutations,
  usePagePreview,
} from "@/hooks/use-pages";
import {
  canCompletePipeline,
  canRegenerateHeroImage,
  canRetryImageGeneration,
  getPartialCompletionHint,
  isPipelineRunning,
  pageHasContent,
  pageHasHeroImage,
} from "@/lib/page-pipeline";

export default function PageDetailPage() {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();
  const { data: page, isLoading } = usePage(pageId);
  const { data: preview } = usePagePreview(pageId, siteId);
  const { data: logs } = usePageLogs(pageId, siteId);
  const { generate, publish, retryImageGeneration, regenerateHeroImage, completePipeline } =
    usePageMutations(pageId);
  const [retryImageOpen, setRetryImageOpen] = useState(false);
  const [regenerateHeroOpen, setRegenerateHeroOpen] = useState(false);
  const [uploadCdnOnRegenerate, setUploadCdnOnRegenerate] = useState(true);
  const [completePipelineOpen, setCompletePipelineOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const auditRef = useRef<ContentAuditPanelHandle>(null);

  const content =
    page?.finalContent ??
    page?.rawDraft ??
    preview?.finalContent ??
    preview?.draft;
  const hasContent = page ? pageHasContent(page) : !!content;
  const pipelineRunning = page ? isPipelineRunning(page.pipelineStatus) : false;
  const showRetryImage = page ? canRetryImageGeneration(page) : false;
  const showRegenerateHero = page ? canRegenerateHeroImage(page) : false;
  const showCompletePipeline = page ? canCompletePipeline(page) : false;
  const partialHint = page ? getPartialCompletionHint(page) : null;

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

  async function handleRegenerateHeroImage() {
    try {
      const result = await regenerateHeroImage.mutateAsync({
        uploadCdn: uploadCdnOnRegenerate,
      });
      setRegenerateHeroOpen(false);
      if (result.cdn?.uploaded && result.cdn.cdnUrl) {
        toast.success("Hero image regenerated", {
          description: "Uploaded to CDN",
        });
      } else if (result.cdn?.skippedReason) {
        toast.success("Hero image regenerated (CDN skipped)", {
          description: result.cdn.skippedReason,
        });
      } else {
        toast.success("Hero image regenerated");
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Hero image regeneration failed",
      );
    }
  }

  async function handleCompletePipeline() {
    try {
      const result = await completePipeline.mutateAsync(undefined);
      setCompletePipelineOpen(false);
      toast.success(
        `Pipeline resumed from ${result.resumedFrom} (task #${result.contentTaskId})`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Complete pipeline failed");
    }
  }

  async function handleRegenerate() {
    try {
      await generate.mutateAsync(true);
      setRegenerateOpen(false);
      toast.success("Regeneration started");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Regeneration failed");
    }
  }

  function handleRunYmylAudit() {
    document
      .getElementById("content-audit")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    auditRef.current?.runAudit();
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
              onClick={() => setRegenerateOpen(true)}
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
            {showCompletePipeline && (
              <Button
                variant="outline"
                onClick={() => setCompletePipelineOpen(true)}
                disabled={completePipeline.isPending || pipelineRunning}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete pipeline
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleRunYmylAudit}
              disabled={auditLoading || !hasContent}
              title={
                hasContent
                  ? undefined
                  : "Generate content first or use Audit custom text in the panel below"
              }
            >
              {auditLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Run YMYL audit
            </Button>
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

      {page.pipelineStatus === "READY" &&
        page.contentAuditResult?.approved === false && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            YMYL audit flagged critical issues — review before publishing.
          </div>
        )}

      {!hasContent && !pipelineRunning && (
        <p className="mb-4 text-sm text-muted-foreground">
          No generated content yet — use Generate content to start the pipeline.
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={page.pipelineStatus} kind="pipeline" />
        <StatusBadge status={page.status} kind="page" />
        {page.contentAuditResult && (
          <YmylAuditBadge audit={page.contentAuditResult} />
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {partialHint && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              {partialHint}
            </div>
          )}
          {page.pipelineStatus === "FAILED" &&
            pageHasContent(page) &&
            pageHasHeroImage(page) && (
              <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                Pipeline failed after the hero image was generated. Use Complete
                pipeline to finish remaining steps without re-running Imagen.
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
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Hero image</CardTitle>
            {showRegenerateHero && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRegenerateHeroOpen(true)}
                disabled={regenerateHeroImage.isPending || pipelineRunning}
              >
                {regenerateHeroImage.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating…
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Regenerate image
                  </>
                )}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {regenerateHeroImage.isPending && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Regenerating hero image with Imagen (30–90s)…
              </div>
            )}
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

      <div className="mb-6">
        <ContentAuditPanel
          ref={auditRef}
          page={page}
          pageId={pageId}
          hasContent={hasContent}
          onLoadingChange={setAuditLoading}
        />
      </div>

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

      <Dialog open={regenerateHeroOpen} onOpenChange={setRegenerateHeroOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate hero image?</DialogTitle>
            <DialogDescription>
              Generate a new Imagen hero image using the current article text.
              Article content will not be changed. This takes about 30–90
              seconds.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Checkbox
              id="upload-cdn"
              checked={uploadCdnOnRegenerate}
              onCheckedChange={(checked) =>
                setUploadCdnOnRegenerate(checked === true)
              }
            />
            <Label htmlFor="upload-cdn" className="text-sm font-normal">
              Upload to CDN after generation (Cloudinary)
            </Label>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setRegenerateHeroOpen(false)}
              disabled={regenerateHeroImage.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerateHeroImage}
              disabled={regenerateHeroImage.isPending}
            >
              {regenerateHeroImage.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating…
                </>
              ) : (
                "Regenerate image"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      <Dialog open={completePipelineOpen} onOpenChange={setCompletePipelineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete pipeline?</DialogTitle>
            <DialogDescription>
              Finish SEO, linking, and finalize this page? The existing hero
              image will be kept.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setCompletePipelineOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompletePipeline}
              disabled={completePipeline.isPending}
            >
              {completePipeline.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Queuing…
                </>
              ) : (
                "Complete pipeline"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate all content?</DialogTitle>
            <DialogDescription>
              This restarts the full pipeline from scratch, including article
              text and hero image. Existing content will be replaced.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setRegenerateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={generate.isPending}
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting…
                </>
              ) : (
                "Regenerate all"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
