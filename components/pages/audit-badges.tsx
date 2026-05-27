import {
  CheckCircle2,
  MinusCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AuditResult } from "@/types/api";

export type YmylBadgeState = "approved" | "failed" | "pending";

export function getYmylBadgeState(
  audit?: AuditResult | null,
): YmylBadgeState {
  if (audit == null) return "pending";
  return audit.approved ? "approved" : "failed";
}

export function SeoCheckBadge({
  passed,
  score,
  className,
}: {
  passed?: boolean | null;
  score?: number | null;
  className?: string;
}) {
  if (passed == null && score == null) {
    return (
      <Badge variant="muted" className={cn("gap-1", className)}>
        <MinusCircle className="h-3 w-3" aria-hidden />
        <span>Not run</span>
      </Badge>
    );
  }

  const pass = passed === true;
  const scoreLabel =
    score != null ? `${Math.round(score)}/100` : pass ? "Pass" : "Fail";

  return (
    <Badge
      variant={pass ? "success" : "destructive"}
      className={cn("gap-1", className)}
    >
      {pass ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden />
      ) : (
        <XCircle className="h-3 w-3" aria-hidden />
      )}
      <span>
        {pass ? "Pass" : "Fail"} {score != null ? scoreLabel : ""}
      </span>
    </Badge>
  );
}

export function YmylAuditBadge({
  audit,
  className,
}: {
  audit?: AuditResult | null;
  className?: string;
}) {
  const state = getYmylBadgeState(audit);

  if (state === "pending") {
    return (
      <Badge variant="muted" className={cn("gap-1", className)}>
        <Shield className="h-3 w-3" aria-hidden />
        <span>Pending</span>
      </Badge>
    );
  }

  if (state === "approved") {
    return (
      <Badge variant="success" className={cn("gap-1", className)}>
        <ShieldCheck className="h-3 w-3" aria-hidden />
        <span>Approved</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className={cn("gap-1", className)}>
      <ShieldAlert className="h-3 w-3" aria-hidden />
      <span>Not approved</span>
    </Badge>
  );
}
