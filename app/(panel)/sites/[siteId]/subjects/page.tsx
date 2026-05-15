"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { SiteDetailTabs } from "@/components/sites/site-detail-tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCreateSubject, useSubjects } from "@/hooks/use-subjects";
import { useGenerateIdeas } from "@/hooks/use-subjects";

export default function SubjectsPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const { data: subjects, isLoading } = useSubjects(siteId);
  const createSubject = useCreateSubject();
  const [createOpen, setCreateOpen] = useState(false);
  const [genOpen, setGenOpen] = useState<string | null>(null);
  const [count, setCount] = useState(10);
  const [provider, setProvider] = useState("google");
  const generate = useGenerateIdeas(genOpen ?? "");
  const [form, setForm] = useState({
    title: "",
    primaryKeywords: "",
    description: "",
  });

  async function handleCreate() {
    try {
      await createSubject.mutateAsync({
        siteId,
        title: form.title,
        description: form.description,
        primaryKeywords: form.primaryKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      });
      toast.success("Subject created");
      setCreateOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function handleGenerate() {
    if (!genOpen) return;
    try {
      await generate.mutateAsync({ count, provider });
      toast.success("Idea generation queued — refresh in a few seconds");
      setGenOpen(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="SEO campaign subjects for idea generation"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New subject
          </Button>
        }
      />
      <SiteDetailTabs siteId={siteId} />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Keywords</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading…</TableCell>
              </TableRow>
            ) : (
              subjects?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/sites/${siteId}/subjects/${s.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {s.title}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {s.primaryKeywords?.join(", ")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGenOpen(s.id)}
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Generate ideas
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Primary keywords (comma-separated)</Label>
              <Input
                value={form.primaryKeywords}
                onChange={(e) =>
                  setForm({ ...form, primaryKeywords: e.target.value })
                }
              />
            </div>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!genOpen} onOpenChange={() => setGenOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate ideas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Count (1–100)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate}>Generate</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
