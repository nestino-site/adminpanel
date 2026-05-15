"use client";

import { useState } from "react";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { useIdeaActions } from "@/hooks/use-ideas";
import type { ContentIdea } from "@/types/api";
import { cn } from "@/lib/utils";

export function IdeaBoard({
  ideas,
  isLoading,
}: {
  ideas: ContentIdea[] | undefined;
  isLoading: boolean;
}) {
  const actions = useIdeaActions();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<ContentIdea | null>(null);
  const [notes, setNotes] = useState("");

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkApprove() {
    try {
      await actions.bulkApprove.mutateAsync({
        ideaIds: Array.from(selected),
        reviewNotes: notes,
      });
      toast.success("Bulk approved");
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  if (isLoading) return <p className="text-muted-foreground">Loading ideas…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!selected.size}
            onClick={bulkApprove}
          >
            Bulk approve ({selected.size})
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!selected.size}
            onClick={() =>
              actions.bulkReject.mutate(
                { ideaIds: Array.from(selected), reviewNotes: notes },
                {
                  onSuccess: () => {
                    toast.success("Bulk rejected");
                    setSelected(new Set());
                  },
                },
              )
            }
          >
            Bulk reject
          </Button>
        </div>

        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Title</TableHead>
                <TableHead>Keyword</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ideas?.map((idea) => (
                <TableRow
                  key={idea.id}
                  className={cn(
                    "cursor-pointer",
                    active?.id === idea.id && "bg-muted/50",
                    (idea.hallucinationRiskScore ?? 0) > 0.7 &&
                      "border-l-4 border-l-amber-500",
                  )}
                  onClick={() => setActive(idea)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(idea.id)}
                      onCheckedChange={() => toggle(idea.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{idea.title}</TableCell>
                  <TableCell>{idea.targetKeyword ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={idea.status} kind="idea" />
                  </TableCell>
                  <TableCell>
                    {idea.hallucinationRiskScore?.toFixed(2) ?? "—"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {idea.status === "PENDING_REVIEW" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              actions.approve.mutate(
                                { id: idea.id, reviewNotes: notes },
                                { onSuccess: () => toast.success("Approved") },
                              )
                            }
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              actions.reject.mutate(
                                { id: idea.id, reviewNotes: notes },
                                { onSuccess: () => toast.success("Rejected") },
                              )
                            }
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              actions.requestRevision.mutate(
                                { id: idea.id, reviewNotes: notes },
                                {
                                  onSuccess: () =>
                                    toast.success("Revision requested"),
                                },
                              )
                            }
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {idea.status === "APPROVED" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            actions.createTask.mutate(idea.id, {
                              onSuccess: () => toast.success("Task created"),
                            })
                          }
                        >
                          Create task
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        {active ? (
          <div className="space-y-4">
            <h3 className="font-semibold">{active.title}</h3>
            <StatusBadge status={active.status} kind="idea" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Review notes
              </p>
              <Textarea
                className="mt-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {active.outline && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Outline
                </p>
                <pre className="mt-1 max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(active.outline, null, 2)}
                </pre>
              </div>
            )}
            {active.headings && (
              <ul className="list-inside list-disc text-sm">
                {active.headings.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
            {actions.createTask.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select an idea to view details
          </p>
        )}
      </div>
    </div>
  );
}
