"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineStepper } from "@/components/pages/pipeline-stepper";
import { StatusBadge } from "@/components/shared/status-badge";
import { isPipelineRunning } from "@/lib/page-pipeline";
import type { Page } from "@/types/api";

export function PipelineStatusPanel({ page }: { page: Page | undefined }) {
  if (!page) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pipeline status</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Create a page to track pipeline progress.
        </CardContent>
      </Card>
    );
  }

  const running = isPipelineRunning(page.pipelineStatus);
  const contentLength =
    page.finalContent?.length ?? page.rawDraft?.length ?? 0;
  const showSpinner =
    page.pipelineStatus === "GENERATING" ||
    page.pipelineStatus === "IMAGE_GENERATING";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Pipeline status</CardTitle>
          <div className="flex items-center gap-2">
            {showSpinner && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            <StatusBadge status={page.pipelineStatus} kind="pipeline" />
            <StatusBadge status={page.status} kind="page" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <PipelineStepper status={page.pipelineStatus} />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Content length</p>
            <p className="font-medium tabular-nums">{contentLength.toLocaleString()} chars</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Page ID</p>
            <p className="font-mono text-sm">{page.id}</p>
          </div>
        </div>

        {page.generatedImageCdnUrl && (
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Hero image</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.generatedImageCdnUrl}
              alt="Generated hero"
              className="max-h-32 rounded-lg border object-cover"
            />
          </div>
        )}

        {running && (
          <p className="text-xs text-muted-foreground">
            Auto-polling every 10s while pipeline is running…
          </p>
        )}

        {page.errorLog && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            {page.errorLog}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
