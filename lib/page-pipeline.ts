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
  if (!pageHasContent(page) || isPipelineRunning(page.pipelineStatus)) {
    return false;
  }
  if (page.pipelineStatus === "READY" && pageHasHeroImage(page)) {
    return false;
  }
  return (
    page.pipelineStatus === "PARTIALLY_COMPLETED" ||
    page.pipelineStatus === "FAILED" ||
    (page.pipelineStatus === "READY" && !pageHasHeroImage(page))
  );
}

export function isImageRelatedTaskError(errorLog?: string): boolean {
  if (!errorLog) return false;
  const lower = errorLog.toLowerCase();
  return lower.includes("imagen") || lower.includes("image_generation");
}
