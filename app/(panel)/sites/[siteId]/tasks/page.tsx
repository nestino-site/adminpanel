"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import { useContentTasks } from "@/hooks/use-tasks";
import { formatDate } from "@/lib/utils";

export default function TasksPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const [status, setStatus] = useState<string>("all");
  const { data: tasks, isLoading } = useContentTasks(
    siteId,
    status === "all" ? undefined : status,
  );

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
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Step</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading…</TableCell>
              </TableRow>
            ) : (
              tasks?.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <StatusBadge status={task.status} kind="task" />
                  </TableCell>
                  <TableCell>{task.type ?? "—"}</TableCell>
                  <TableCell>{task.currentStep ?? "—"}</TableCell>
                  <TableCell>{task.attempts ?? 0}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {task.pageId?.slice(0, 8) ?? "—"}
                  </TableCell>
                  <TableCell>{formatDate(task.startedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {tasks?.some((t) => t.errorLog) && (
          <div className="border-t p-4">
            <p className="mb-2 text-sm font-medium">Error logs</p>
            {tasks
              .filter((t) => t.errorLog)
              .map((t) => (
                <pre
                  key={t.id}
                  className="mb-2 rounded bg-destructive/10 p-2 text-xs"
                >
                  {t.errorLog}
                </pre>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
