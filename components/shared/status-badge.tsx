import { Badge } from "@/components/ui/badge";
import type {
  IdeaStatus,
  PageStatus,
  PipelineStatus,
  SubjectStatus,
  TaskStatus,
} from "@/types/api";

type StatusKind =
  | PageStatus
  | PipelineStatus
  | IdeaStatus
  | TaskStatus
  | SubjectStatus
  | string;

const pageStatusMap: Record<string, "default" | "success" | "warning" | "muted"> = {
  DRAFT: "muted",
  PUBLISHED: "success",
  NEEDS_UPDATE: "warning",
  ARCHIVED: "muted",
};

const pipelineStatusMap: Record<
  string,
  "default" | "success" | "destructive" | "info" | "warning" | "muted"
> = {
  PENDING: "muted",
  GENERATING: "info",
  VALIDATING: "info",
  ANALYZING: "info",
  GEO_SCORING: "info",
  REWRITING: "info",
  IMAGE_GENERATING: "info",
  SEO_CHECKING: "info",
  READY: "success",
  FAILED: "destructive",
  PARTIALLY_COMPLETED: "warning",
  SKIPPED_STEP: "muted",
};

const ideaStatusMap: Record<string, "default" | "success" | "destructive" | "warning" | "muted"> = {
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  NEEDS_REVISION: "warning",
};

const taskStatusMap: Record<string, "default" | "success" | "destructive" | "info" | "muted"> = {
  QUEUED: "muted",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "destructive",
  CANCELLED: "muted",
};

function resolveVariant(status: string, kind?: "page" | "pipeline" | "idea" | "task") {
  if (kind === "pipeline") return pipelineStatusMap[status] ?? "default";
  if (kind === "idea") return ideaStatusMap[status] ?? "default";
  if (kind === "task") return taskStatusMap[status] ?? "default";
  if (pipelineStatusMap[status]) return pipelineStatusMap[status];
  if (ideaStatusMap[status]) return ideaStatusMap[status];
  if (pageStatusMap[status]) return pageStatusMap[status];
  if (taskStatusMap[status]) return taskStatusMap[status];
  return "default" as const;
}

function formatLabel(status: StatusKind) {
  return String(status ?? "unknown")
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusBadge({
  status,
  kind,
}: {
  status: StatusKind;
  kind?: "page" | "pipeline" | "idea" | "task";
}) {
  const variant = resolveVariant(status, kind);
  return <Badge variant={variant}>{formatLabel(status)}</Badge>;
}
