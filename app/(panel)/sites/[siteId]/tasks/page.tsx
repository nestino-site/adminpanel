"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { SiteDetailTabs } from "@/components/sites/site-detail-tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { useContentTasks, useRetryTask } from "@/hooks/use-tasks";
import { isImageRelatedTaskError } from "@/lib/page-pipeline";
import { formatDate, formatShortId } from "@/lib/utils";

export default function TasksPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const [status, setStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const { data: tasks, isLoading } = useContentTasks(
    siteId,
    status === "all" ? undefined : status,
  );
  const retryTask = useRetryTask();

  function toggleExpanded(taskId: string | number) {
    setExpandedId((current) => (current === taskId ? null : taskId));
  }

  return (
    <div>
      <PageHeader title="Content tasks" description="AI pipeline task tracking" />
      <SiteDetailTabs siteId={siteId} />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="mb-4 w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Step</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>Loading…</TableCell>
              </TableRow>
            ) : tasks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              tasks?.map((task) => {
                const expanded = expandedId === task.id;
                const hasDetails = !!task.errorLog;

                return (
                  <Fragment key={task.id}>
                    <TableRow>
                      <TableCell>
                        {hasDetails ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleExpanded(task.id)}
                            aria-label={expanded ? "Collapse row" : "Expand row"}
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} kind="task" />
                      </TableCell>
                      <TableCell>{task.type ?? "—"}</TableCell>
                      <TableCell>{task.currentStep ?? "—"}</TableCell>
                      <TableCell>{task.attempts ?? 0}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {task.pageId ? (
                          <Link
                            href={`/sites/${siteId}/pages/${task.pageId}`}
                            className="text-primary hover:underline"
                          >
                            {formatShortId(task.pageId)}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(task.startedAt)}</TableCell>
                      <TableCell className="text-right">
                        {task.status === "FAILED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={retryTask.isPending}
                            onClick={() =>
                              retryTask.mutate(task.id, {
                                onSuccess: () => toast.success("Task requeued"),
                                onError: (e) => toast.error(e.message),
                              })
                            }
                          >
                            {retryTask.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Retry task
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expanded && task.errorLog && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/20">
                          <pre className="mb-2 whitespace-pre-wrap rounded bg-destructive/10 p-3 text-xs text-destructive">
                            {task.errorLog}
                          </pre>
                          {isImageRelatedTaskError(task.errorLog) &&
                            task.pageId && (
                              <p className="text-xs text-muted-foreground">
                                This looks like an image generation failure. You
                                can also use{" "}
                                <Link
                                  href={`/sites/${siteId}/pages/${task.pageId}`}
                                  className="font-medium text-primary hover:underline"
                                >
                                  Retry image generation
                                </Link>{" "}
                                on the linked page to rerun only the hero image
                                step.
                              </p>
                            )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
