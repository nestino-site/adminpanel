"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { usePages } from "@/hooks/use-pages";
import { formatDate } from "@/lib/utils";

export default function PagesListPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pipelineFilter, setPipelineFilter] = useState<string>("all");
  const { data: pages, isLoading } = usePages(siteId);

  const filtered = pages?.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (pipelineFilter !== "all" && p.pipelineStatus !== pipelineFilter)
      return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Content pages and pipeline status"
        action={
          <Button asChild>
            <Link href={`/sites/${siteId}/guides/create`}>Create Guide</Link>
          </Button>
        }
      />
      <SiteDetailTabs siteId={siteId} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Page status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pipeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All pipelines</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="GENERATING">Generating</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Pipeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>SEO</TableHead>
              <TableHead>Published</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>Loading…</TableCell>
              </TableRow>
            ) : (
              filtered?.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {page.slug}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={page.pipelineStatus} kind="pipeline" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={page.status} kind="page" />
                  </TableCell>
                  <TableCell>{page.seoScore?.toFixed(1) ?? "—"}</TableCell>
                  <TableCell>{formatDate(page.publishedAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/sites/${siteId}/pages/${page.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
