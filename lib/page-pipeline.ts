import type { Page, PipelineStatus } from "@/types/api";

const RUNNING_PIPELINE_STATUSES = new Set<PipelineStatus>([
  "PENDING",
  "GENERATING",
  "VALIDATING",
  "ANALYZING",
  "GEO_SCORING",
  "REWRITING",
  "IMAGE_GENERATING",
  "SEO_CHECKING",
]);

export function pageHasContent(page: Pick<Page, "rawDraft" | "finalContent">): boolean {
  return !!(page.rawDraft || page.finalContent);
}

export function pageHasHeroImage(
  page: Pick<Page, "generatedImageBase64" | "generatedImageCdnUrl">,
): boolean {
  return !!(page.generatedImageBase64 || page.generatedImageCdnUrl);
}

export function isPipelineRunning(status: PipelineStatus): boolean {
  return RUNNING_PIPELINE_STATUSES.has(status);
}

export function canRetryImageGeneration(page: Page): boolean {
  if (
    !pageHasContent(page) ||
    pageHasHeroImage(page) ||
    isPipelineRunning(page.pipelineStatus)
  ) {
    return false;
  }
  return (
    page.pipelineStatus === "PARTIALLY_COMPLETED" ||
    page.pipelineStatus === "FAILED" ||
    page.pipelineStatus === "READY"
  );
}

export function canRegenerateHeroImage(
  page: Page,
  hasContent = pageHasContent(page),
): boolean {
  if (
    !pageHasHeroImage(page) ||
    !hasContent ||
    isPipelineRunning(page.pipelineStatus)
  ) {
    return false;
  }
  return true;
}

export function canCompletePipeline(
  page: Page,
  hasContent = pageHasContent(page),
): boolean {
  if (
    !hasContent ||
    !pageHasHeroImage(page) ||
    isPipelineRunning(page.pipelineStatus)
  ) {
    return false;
  }
  return (
    page.pipelineStatus === "PARTIALLY_COMPLETED" ||
    page.pipelineStatus === "FAILED"
  );
}

/** Content + hero image done; pipeline not READY yet — eligible for mark-content-ready. */
export function canMarkContentReady(page: Page, hasContent: boolean): boolean {
  if (
    !hasContent ||
    !pageHasHeroImage(page) ||
    isPipelineRunning(page.pipelineStatus) ||
    page.pipelineStatus === "READY"
  ) {
    return false;
  }
  return (
    page.pipelineStatus === "PARTIALLY_COMPLETED" ||
    page.pipelineStatus === "FAILED"
  );
}

export function getMarkContentReadyHint(page: Page): string {
  if (page.pipelineStatus === "FAILED") {
    return "Content and hero image are ready, but the pipeline failed at a later step. Mark ready to set status to Ready for human review and publish. YMYL audit results stay advisory.";
  }
  return "Content and hero image are ready. Mark ready to approve for publish — audit warnings do not block this step.";
}

export function canEditPageContent(page: Page): boolean {
  const hasFinal = Boolean(page.finalContent?.trim());
  if (!hasFinal) return false;
  return (
    page.pipelineStatus === "READY" ||
    page.pipelineStatus === "PARTIALLY_COMPLETED" ||
    page.pipelineStatus === "FAILED"
  );
}

export function getPartialCompletionHint(page: Page): string | null {
  if (page.pipelineStatus !== "PARTIALLY_COMPLETED") return null;
  if (pageHasHeroImage(page)) {
    return "Content and hero image are ready, but later pipeline steps failed. Use Mark ready to set the page to Ready for review and publish.";
  }
  return "Content generated, but image step failed. You can retry image generation.";
}

export function isImageRelatedTaskError(errorLog?: string): boolean {
  if (!errorLog) return false;
  const lower = errorLog.toLowerCase();
  return lower.includes("imagen") || lower.includes("image_generation");
}
