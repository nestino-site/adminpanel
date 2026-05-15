"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateSiteWizard } from "@/components/sites/create-site-wizard";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useSites } from "@/hooks/use-sites";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

export default function SitesPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { data: sites, isLoading } = useSites();
  const setActiveSiteId = useAuthStore((s) => s.setActiveSiteId);

  return (
    <div>
      <PageHeader
        title="Sites"
        description="Manage multi-site SEO operations"
        action={
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create site
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : !sites?.length ? (
        <EmptyState
          title="No sites yet"
          description="Create your first site to start the SEO pipeline."
          action={
            <Button onClick={() => setWizardOpen(true)}>Create site</Button>
          }
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auto publish</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow
                  key={site.id}
                  className="cursor-pointer"
                  onClick={() => setActiveSiteId(site.id)}
                >
                  <TableCell>
                    <Link
                      href={`/sites/${site.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {site.name}
                    </Link>
                  </TableCell>
                  <TableCell>{site.domain}</TableCell>
                  <TableCell>{site.status ?? "—"}</TableCell>
                  <TableCell>{site.autoPublish ? "Yes" : "No"}</TableCell>
                  <TableCell>{formatDate(site.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateSiteWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
