"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  SeoCheckBadge,
  YmylAuditBadge,
} from "@/components/pages/audit-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getAuditErrorMessage, useAuditPage } from "@/hooks/use-pages";
import { cn } from "@/lib/utils";
import type { AuditResult, Page } from "@/types/api";

function isSystemAuditError(criticalErrors: string): boolean {
  return criticalErrors.trim().startsWith("Audit failed due to system error");
}

function AuditContent({
  audit,
  page,
  isSpotCheck,
}: {
  audit: AuditResult;
  page: Page;
  isSpotCheck: boolean;
}) {
  const showCriticalErrors =
    !audit.approved || audit.critical_errors.trim().length > 0;
  const linking = audit.internal_linking_audit;

  return (
    <div className="space-y-4">
      {isSpotCheck && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Spot-check only. Pipeline audit on generate is saved to{" "}
          <code className="text-xs">contentAuditResult</code>.
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {audit.approved ? (
            <Badge variant="success" className="gap-1.5 px-3 py-1 text-sm">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Approved
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-sm">
              <XCircle className="h-4 w-4" aria-hidden />
              Not approved
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SEO check (pipeline)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SeoCheckBadge
              passed={page.seoCheckPassed}
              score={page.seoCheckScore}
            />
            {page.seoCheckScore != null && (
              <p className="text-xs text-muted-foreground">
                Automated SEO evaluation score from the content pipeline.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              YMYL fact-check (Gemini + Google Search)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">E-E-A-T score</span>
              <span>{audit.eeat_score}/10</span>
            </div>
            <Progress value={audit.eeat_score * 10} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Credibility assessment for medical and legal YMYL content.
            </p>
          </CardContent>
        </Card>
      </div>

      {showCriticalErrors && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Critical errors
          </div>
          <pre className="whitespace-pre-wrap text-sm text-destructive">
            {audit.critical_errors || "Content did not pass YMYL approval."}
          </pre>
          {isSystemAuditError(audit.critical_errors) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Operator hint: set{" "}
              <code className="text-xs">GEMINI_API_KEY</code> on the backend.
            </p>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Link2 className="h-4 w-4" aria-hidden />
            Internal linking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Badge
            variant={
              linking.status === "approved" ? "success" : "warning"
            }
            className="gap-1"
          >
            {linking.status === "approved" ? (
              <CheckCircle2 className="h-3 w-3" aria-hidden />
            ) : (
              <AlertTriangle className="h-3 w-3" aria-hidden />
            )}
            {linking.status === "approved" ? "Approved" : "Needs fix"}
          </Badge>
          {linking.details.trim() && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs">
                {linking.details}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>

      {audit.seo_and_ux_recommendations.trim() && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              SEO &amp; UX recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
              {audit.seo_and_ux_recommendations}
            </pre>
          </CardContent>
        </Card>
      )}

      {page.seoCheckIssues?.issues && page.seoCheckIssues.issues.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pipeline SEO issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-muted-foreground">
              From the pipeline SEO evaluation — separate from the YMYL
              fact-check above.
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {page.seoCheckIssues.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export type ContentAuditPanelHandle = {
  runAudit: () => void;
  openCustomTextModal: () => void;
  isLoading: boolean;
};

type ContentAuditPanelProps = {
  page: Page;
  pageId: string;
  hasContent?: boolean;
  onLoadingChange?: (loading: boolean) => void;
};

export const ContentAuditPanel = forwardRef<
  ContentAuditPanelHandle,
  ContentAuditPanelProps
>(function ContentAuditPanel(
  { page, pageId, hasContent = true, onLoadingChange },
  ref,
) {
  const auditMutation = useAuditPage(pageId);
  const [spotCheckResult, setSpotCheckResult] = useState<AuditResult | null>(
    null,
  );
  const [customTextOpen, setCustomTextOpen] = useState(false);
  const [customContent, setCustomContent] = useState("");
  const [auditError, setAuditError] = useState<string | null>(null);

  const storedAudit = page.contentAuditResult;
  const displayAudit = spotCheckResult ?? storedAudit ?? null;
  const isSpotCheck = spotCheckResult != null;

  async function runAudit(content?: string) {
    setAuditError(null);
    try {
      const result = await auditMutation.mutateAsync(content);
      setSpotCheckResult(result);
      setCustomTextOpen(false);
      setCustomContent("");
      toast.success("Audit complete (not saved)");
    } catch (e) {
      const message = getAuditErrorMessage(e);
      setAuditError(message);
      toast.error(message);
    }
  }

  const isLoading = auditMutation.isPending;

  useImperativeHandle(
    ref,
    () => ({
      runAudit: () => {
        void runAudit();
      },
      openCustomTextModal: () => setCustomTextOpen(true),
      isLoading,
    }),
    [isLoading],
  );

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const canRunPageAudit = hasContent;

  return (
    <Card id="content-audit" className="scroll-mt-6">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Content audit</CardTitle>
          {displayAudit && (
            <YmylAuditBadge audit={displayAudit} className="mt-1" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAudit()}
            disabled={isLoading || !canRunPageAudit}
            title={
              canRunPageAudit
                ? undefined
                : "Generate content first or use Audit custom text"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-run audit
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomTextOpen(true)}
            disabled={isLoading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Audit custom text
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary",
            )}
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Running YMYL audit (30–120s)…
          </div>
        )}

        {auditError && !isLoading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {auditError}
          </div>
        )}

        {displayAudit ? (
          <AuditContent
            audit={displayAudit}
            page={page}
            isSpotCheck={isSpotCheck}
          />
        ) : (
          !isLoading && (
            <p className="text-sm text-muted-foreground">
              Run content generation or click Re-run audit to evaluate this
              page for YMYL compliance.
            </p>
          )
        )}
      </CardContent>

      <Dialog open={customTextOpen} onOpenChange={setCustomTextOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit custom text</DialogTitle>
            <DialogDescription>
              Paste draft markdown to spot-check before publish. Results are not
              saved to the database.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={customContent}
            onChange={(e) => setCustomContent(e.target.value)}
            placeholder="Paste article markdown…"
            rows={12}
            className="font-mono text-sm"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setCustomTextOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => runAudit(customContent.trim() || undefined)}
              disabled={isLoading || !customContent.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running…
                </>
              ) : (
                "Run audit"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});
