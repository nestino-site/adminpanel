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

export function canCompletePipeline(page: Page): boolean {
  if (
    !pageHasContent(page) ||
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

export function getPartialCompletionHint(page: Page): string | null {
  if (page.pipelineStatus !== "PARTIALLY_COMPLETED") return null;
  if (pageHasHeroImage(page)) {
    return "Content and hero image are ready, but later pipeline steps failed. Use Complete pipeline to finish SEO, linking, and schema.";
  }
  return "Content generated, but image step failed. You can retry image generation.";
}

export function isImageRelatedTaskError(errorLog?: string): boolean {
  if (!errorLog) return false;
  const lower = errorLog.toLowerCase();
  return lower.includes("imagen") || lower.includes("image_generation");
}
