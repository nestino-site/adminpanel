import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContentIdea, IdeaTask, Subject } from "@/types/api";

export function useSubjectIdeas(
  subjectId: string | undefined,
  status?: string,
  poll = false,
) {
  const params = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["ideas", subjectId, status],
    queryFn: () =>
      api.get<ContentIdea[]>(`/subjects/${subjectId}/ideas${params}`),
    enabled: !!subjectId,
    refetchInterval: poll ? 5000 : false,
  });
}

export function useAllPendingIdeas(siteId: string | undefined) {
  return useQuery({
    queryKey: ["ideas", "pending-review", siteId],
    queryFn: async () => {
      if (!siteId) return [] as ContentIdea[];
      const subjects = await api.get<Subject[]>(`/subjects?siteId=${siteId}`);
      if (!subjects.length) return [];
      const lists = await Promise.all(
        subjects.map((s) =>
          api.get<ContentIdea[]>(
            `/subjects/${s.id}/ideas?status=PENDING_REVIEW`,
          ),
        ),
      );
      return lists.flat();
    },
    enabled: !!siteId,
    refetchInterval: 10000,
  });
}

export function useIdeaActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["ideas"] });

  return {
    approve: useMutation({
      mutationFn: ({
        id,
        reviewNotes,
      }: {
        id: string;
        reviewNotes?: string;
      }) => api.patch(`/content-ideas/${id}/approve`, { reviewNotes }),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: ({
        id,
        reviewNotes,
      }: {
        id: string;
        reviewNotes?: string;
      }) => api.patch(`/content-ideas/${id}/reject`, { reviewNotes }),
      onSuccess: invalidate,
    }),
    requestRevision: useMutation({
      mutationFn: ({
        id,
        reviewNotes,
      }: {
        id: string;
        reviewNotes?: string;
      }) =>
        api.patch(`/content-ideas/${id}/request-revision`, { reviewNotes }),
      onSuccess: invalidate,
    }),
    bulkApprove: useMutation({
      mutationFn: (body: { ideaIds: string[]; reviewNotes?: string }) =>
        api.post("/content-ideas/bulk-approve", body),
      onSuccess: invalidate,
    }),
    bulkReject: useMutation({
      mutationFn: (body: { ideaIds: string[]; reviewNotes?: string }) =>
        api.post("/content-ideas/bulk-reject", body),
      onSuccess: invalidate,
    }),
    createTask: useMutation({
      mutationFn: (ideaId: string) =>
        api.post<IdeaTask>(`/content-ideas/${ideaId}/create-task`),
      onSuccess: invalidate,
    }),
  };
}
