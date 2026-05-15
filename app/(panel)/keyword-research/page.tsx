"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function KeywordResearchPage() {
  return (
    <div>
      <PageHeader
        title="Keyword research"
        description="Research tool powered by Traffic Engine API"
      />
      <EmptyState
        title="Keyword research"
        description="Use POST /keyword-research from Swagger or integrate research UI in a future release."
      />
    </div>
  );
}
