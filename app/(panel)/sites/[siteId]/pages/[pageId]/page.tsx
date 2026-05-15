"use client";

import { useParams } from "next/navigation";
import { Loader2, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

export default function PageDetailPage() {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();
  const { data: page, isLoading } = usePage(pageId);
  const { data: preview } = usePagePreview(pageId, siteId);
  const { data: logs } = usePageLogs(pageId, siteId);
  const { generate, publish } = usePageMutations(pageId);

  const content = page?.finalContent ?? preview?.finalContent ?? preview?.draft;

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                generate.mutate(true, {
                  onSuccess: () => toast.success("Regeneration started"),
                })
              }
              disabled={generate.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
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

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={page.pipelineStatus} kind="pipeline" />
        <StatusBadge status={page.status} kind="page" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineStepper status={page.pipelineStatus} />
          {page.errorLog && (
            <pre className="mt-4 rounded bg-destructive/10 p-3 text-xs text-destructive">
              {page.errorLog}
            </pre>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
