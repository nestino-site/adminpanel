"use client";

import { useParams } from "next/navigation";
import { IdeaBoard } from "@/components/ideas/idea-board";
import { PageHeader } from "@/components/shared/page-header";
import { useSubject } from "@/hooks/use-subjects";
import { useSubjectIdeas } from "@/hooks/use-ideas";

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { data: subject } = useSubject(subjectId);
  const { data: ideas, isLoading } = useSubjectIdeas(subjectId, undefined, true);

  return (
    <div>
      <PageHeader
        title={subject?.title ?? "Subject"}
        description={subject?.primaryKeywords?.join(", ")}
      />
      <IdeaBoard ideas={ideas} isLoading={isLoading} />
    </div>
  );
}
