"use client";

import { useParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { SiteDetailTabs } from "@/components/sites/site-detail-tabs";
import {
  useSeoCannibalization,
  useSeoGeoScores,
  useSeoMetrics,
  useSeoOrphans,
  useSeoQuickWins,
} from "@/hooks/use-seo";

export default function SeoPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const { data: quickWins } = useSeoQuickWins(siteId);
  const { data: cannibalization } = useSeoCannibalization(siteId);
  const { data: orphans } = useSeoOrphans(siteId);
  const { data: geoScores } = useSeoGeoScores(siteId);
  const { data: metrics } = useSeoMetrics(siteId, 30);

  const chartData =
    metrics?.map((m) => ({
      date: m.date,
      clicks: m.clicks ?? 0,
      impressions: m.impressions ?? 0,
    })) ?? [];

  const geoChart = Array.isArray(geoScores)
    ? (geoScores as { label?: string; score?: number }[]).map((g, i) => ({
        name: g.label ?? `Page ${i + 1}`,
        score: g.score ?? 0,
      }))
    : [];

  return (
    <div>
      <PageHeader title="SEO strategy" description="Insights and metrics" />
      <SiteDetailTabs siteId={siteId} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metrics (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No metrics data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">GEO scores</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {geoChart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geoChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No GEO data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick wins</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto text-xs">
              {JSON.stringify(quickWins ?? [], null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cannibalization</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto text-xs">
              {JSON.stringify(cannibalization ?? [], null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Keyword orphans</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto text-xs">
              {JSON.stringify(orphans ?? [], null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
