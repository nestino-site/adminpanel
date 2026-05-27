import { AlertTriangle, Check, Circle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineStatus } from "@/types/api";

const STEPS: { key: PipelineStatus; label: string }[] = [
  { key: "PENDING", label: "Queued" },
  { key: "GENERATING", label: "Writing" },
  { key: "VALIDATING", label: "Policy" },
  { key: "ANALYZING", label: "SEO" },
  { key: "GEO_SCORING", label: "GEO" },
  { key: "REWRITING", label: "Rewrite" },
  { key: "IMAGE_GENERATING", label: "Image" },
  { key: "SEO_CHECKING", label: "SEO check" },
  { key: "READY", label: "Ready" },
];

function stepIndex(status: PipelineStatus) {
  if (status === "PARTIALLY_COMPLETED") {
    return STEPS.findIndex((s) => s.key === "IMAGE_GENERATING");
  }
  const idx = STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  if (status === "FAILED") return -1;
  return 0;
}

export function PipelineStepper({ status }: { status: PipelineStatus }) {
  const current = stepIndex(status);
  const failed = status === "FAILED";
  const partiallyCompleted = status === "PARTIALLY_COMPLETED";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((step, i) => {
          const done =
            !failed &&
            !partiallyCompleted &&
            i < current;
          const active = !failed && !partiallyCompleted && i === current;
          const isFailed = failed && i === 0;
          const imageStepFailed =
            partiallyCompleted && step.key === "IMAGE_GENERATING";

          return (
            <div
              key={step.key}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium",
                done &&
                  "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
                active &&
                  "border-primary bg-primary/10 text-primary animate-pulse-soft",
                !done &&
                  !active &&
                  !isFailed &&
                  !imageStepFailed &&
                  "border-border bg-muted/30 text-muted-foreground",
                isFailed &&
                  "border-destructive bg-destructive/10 text-destructive",
                imageStepFailed &&
                  "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
                partiallyCompleted &&
                  i < current &&
                  "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
              )}
            >
              {done || (partiallyCompleted && i < current) ? (
                <Check className="h-3.5 w-3.5" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isFailed || imageStepFailed ? (
                imageStepFailed ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
              {step.label}
            </div>
          );
        })}
      </div>
      {status === "SEO_CHECKING" && (
        <p className="text-xs text-primary animate-pulse-soft">
          SEO eval + YMYL audit (parallel)
        </p>
      )}
    </div>
  );
}
