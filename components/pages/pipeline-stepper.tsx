import { Check, Circle, Loader2, X } from "lucide-react";
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
  { key: "SEO_CHECKING", label: "SEO polish" },
  { key: "READY", label: "Ready" },
];

function stepIndex(status: PipelineStatus) {
  const idx = STEPS.findIndex((s) => s.key === status);
  if (idx >= 0) return idx;
  if (status === "FAILED") return -1;
  return 0;
}

export function PipelineStepper({ status }: { status: PipelineStatus }) {
  const current = stepIndex(status);
  const failed = status === "FAILED";

  return (
    <div className="flex flex-wrap gap-2">
      {STEPS.map((step, i) => {
        const done = !failed && i < current;
        const active = !failed && i === current;
        const isFailed = failed && i === 0;

        return (
          <div
            key={step.key}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium",
              done && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
              active && "border-primary bg-primary/10 text-primary animate-pulse-soft",
              !done && !active && !isFailed && "border-border bg-muted/30 text-muted-foreground",
              isFailed && "border-destructive bg-destructive/10 text-destructive",
            )}
          >
            {done ? (
              <Check className="h-3.5 w-3.5" />
            ) : active ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isFailed ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Circle className="h-3.5 w-3.5" />
            )}
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
