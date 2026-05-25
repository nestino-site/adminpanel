"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { snippetResponse, type RequestLogEntry } from "@/lib/guide-workflow";

function statusVariant(status: number | null) {
  if (status == null) return "destructive" as const;
  if (status >= 200 && status < 300) return "success" as const;
  if (status >= 400) return "destructive" as const;
  return "default" as const;
}

function LogRow({ entry }: { entry: RequestLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(entry.timestamp).toLocaleTimeString();

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell className="w-8">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
          {time}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="font-mono text-xs">
            {entry.method}
          </Badge>
        </TableCell>
        <TableCell className="max-w-[200px] truncate font-mono text-xs">
          {entry.path}
        </TableCell>
        <TableCell>
          {entry.status != null ? (
            <Badge variant={statusVariant(entry.status)}>{entry.status}</Badge>
          ) : (
            <Badge variant="destructive">ERR</Badge>
          )}
        </TableCell>
        <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
          {snippetResponse(entry.response, entry.error)}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-4">
            <div className="space-y-3">
              {entry.requestBody != null && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Request body
                  </p>
                  <pre className="max-h-48 overflow-auto rounded-md bg-background p-3 text-xs">
                    {JSON.stringify(entry.requestBody, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {entry.error ? "Error" : "Response"}
                </p>
                <pre className="max-h-64 overflow-auto rounded-md bg-background p-3 text-xs">
                  {entry.error
                    ? entry.error
                    : JSON.stringify(entry.response, null, 2)}
                </pre>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function RequestLogTable({ entries }: { entries: RequestLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No requests yet. Execute a workflow step to see the log.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Time</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Snippet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <LogRow key={entry.id} entry={entry} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
