"use client";

import { useParams } from "next/navigation";
import { IdeaBoard } from "@/components/ideas/idea-board";
import { PageHeader } from "@/components/shared/page-header";
import { SiteDetailTabs } from "@/components/sites/site-detail-tabs";
import { useAllPendingIdeas } from "@/hooks/use-ideas";

export default function IdeaReviewPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const { data: ideas, isLoading } = useAllPendingIdeas(siteId);

  return (
    <div>
      <PageHeader
        title="Idea review queue"
        description="Approve, reject, or request revisions before creating content tasks"
      />
      <SiteDetailTabs siteId={siteId} />
      <IdeaBoard ideas={ideas} isLoading={isLoading} />
    </div>
  );
}
