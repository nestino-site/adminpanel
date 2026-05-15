"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteConfigForm } from "@/components/sites/site-config-form";
import { SiteDetailTabs } from "@/components/sites/site-detail-tabs";
import { SiteOverview } from "@/components/sites/site-overview";
import { PageHeader } from "@/components/shared/page-header";
import { useSite } from "@/hooks/use-sites";
import { useAuthStore } from "@/lib/store";

export default function SiteDetailPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const { data: site } = useSite(siteId);
  const setActiveSiteId = useAuthStore((s) => s.setActiveSiteId);

  useEffect(() => {
    if (siteId) setActiveSiteId(siteId);
  }, [siteId, setActiveSiteId]);

  return (
    <div>
      <PageHeader
        title={site?.name ?? "Site"}
        description={site?.domain}
      />
      <SiteDetailTabs siteId={siteId} />
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SiteOverview siteId={siteId} />
        </TabsContent>
        <TabsContent value="config">
          <SiteConfigForm siteId={siteId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
