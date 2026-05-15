"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Globe, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { useAllPendingIdeas } from "@/hooks/use-ideas";
import { usePages } from "@/hooks/use-pages";
import { useSites } from "@/hooks/use-sites";
import { useContentTasks } from "@/hooks/use-tasks";
import { useAuthStore } from "@/lib/store";

export default function DashboardPage() {
  const activeSiteId = useAuthStore((s) => s.activeSiteId);
  const { data: sites, isLoading: sitesLoading } = useSites();
  const { data: pages } = usePages(activeSiteId ?? undefined);
  const { data: ideas } = useAllPendingIdeas(activeSiteId ?? undefined);
  const { data: tasks } = useContentTasks(activeSiteId ?? undefined);

  const readyPages = pages?.filter((p) => p.pipelineStatus === "READY").length ?? 0;
  const pendingIdeas = ideas?.length ?? 0;
  const failedTasks =
    tasks?.filter((t) => t.status === "FAILED").length ?? 0;

  const kpis = [
    {
      label: "Total sites",
      value: sites?.length ?? 0,
      icon: Globe,
      href: "/sites",
    },
    {
      label: "Pages ready",
      value: readyPages,
      icon: CheckCircle2,
      href: activeSiteId ? `/sites/${activeSiteId}/pages` : "/sites",
    },
    {
      label: "Ideas pending review",
      value: pendingIdeas,
      icon: Lightbulb,
      href: activeSiteId
        ? `/sites/${activeSiteId}/ideas/review`
        : "/sites",
    },
    {
      label: "Failed tasks",
      value: failedTasks,
      icon: AlertTriangle,
      href: activeSiteId ? `/sites/${activeSiteId}/tasks` : "/sites",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your Traffic Engine operations"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {sitesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold">{kpi.value}</p>
              )}
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <Link href={kpi.href}>View →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link
            href={
              activeSiteId
                ? `/sites/${activeSiteId}/ideas/review`
                : "/sites"
            }
          >
            Review ideas
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link
            href={
              activeSiteId ? `/sites/${activeSiteId}/tasks` : "/sites"
            }
          >
            View failed tasks
          </Link>
        </Button>
      </div>

      {pages && pages.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent pages</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pages.slice(0, 10).map((page) => (
                <li
                  key={page.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-2 text-sm"
                >
                  <span className="font-medium">{page.title}</span>
                  <span className="text-muted-foreground">
                    {page.pipelineStatus}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
