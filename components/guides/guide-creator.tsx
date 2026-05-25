"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SiteDetailTabs } from "@/components/sites/site-detail-tabs";
import { GuideWizardForm } from "@/components/guides/guide-wizard-form";
import { GuideJsonEditor } from "@/components/guides/guide-json-editor";
import { PipelineStatusPanel } from "@/components/guides/pipeline-status-panel";
import { RequestLogTable } from "@/components/guides/request-log-table";
import { useGuideCreator } from "@/hooks/use-guide-creator";
import { usePages } from "@/hooks/use-pages";
import { useAuthStore } from "@/lib/store";
import type { GuideStepId } from "@/lib/guide-workflow";

export function GuideCreator() {
  const { siteId } = useParams<{ siteId: string }>();
  const setActiveSiteId = useAuthStore((s) => s.setActiveSiteId);
  const creator = useGuideCreator(siteId);
  const { data: pages } = usePages(siteId);
  const [activeJsonStep, setActiveJsonStep] =
    useState<GuideStepId>("createKeyword");

  useEffect(() => {
    setActiveSiteId(siteId);
  }, [siteId, setActiveSiteId]);

  const duplicatePage = useMemo(
    () => pages?.find((p) => p.slug === creator.form.slug),
    [pages, creator.form.slug],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Guide"
        description="MedCover IVF destination guides — keyword to publish workflow"
      />
      <SiteDetailTabs siteId={siteId} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <GuideWizardForm
            creator={creator}
            existingPage={duplicatePage}
            siteId={siteId}
          />
          <PipelineStatusPanel page={creator.page} />
        </div>
        <GuideJsonEditor
          form={creator.form}
          ids={creator.ids}
          jsonOverrides={creator.jsonOverrides}
          onOverrideChange={creator.updateJsonOverride}
          activeStep={activeJsonStep}
          onActiveStepChange={setActiveJsonStep}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Request / response log</h2>
        <RequestLogTable entries={creator.requestLog} />
      </div>
    </div>
  );
}
