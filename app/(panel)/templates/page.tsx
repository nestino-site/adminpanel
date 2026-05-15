"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { useTemplateMutations, useTemplates } from "@/hooks/use-templates";

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const { create, remove } = useTemplateMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    requiredSections: "{}",
    headingStructure: "{}",
    seoRules: "{}",
    faqStructure: "{}",
  });

  async function handleCreate() {
    try {
      await create.mutateAsync({
        name: form.name,
        description: form.description,
        requiredSections: JSON.parse(form.requiredSections),
        headingStructure: JSON.parse(form.headingStructure),
        seoRules: JSON.parse(form.seoRules),
        faqStructure: JSON.parse(form.faqStructure),
        isActive: true,
      });
      toast.success("Template created");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid JSON or failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Global content templates for subjects"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New template
          </Button>
        }
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Content type</TableHead>
              <TableHead>Active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading…</TableCell>
              </TableRow>
            ) : (
              templates?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.contentType ?? "—"}</TableCell>
                  <TableCell>{t.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        remove.mutate(t.id, {
                          onSuccess: () => toast.success("Deleted"),
                        })
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            {(
              [
                "requiredSections",
                "headingStructure",
                "seoRules",
                "faqStructure",
              ] as const
            ).map((key) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Textarea
                  className="font-mono text-xs"
                  rows={4}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
