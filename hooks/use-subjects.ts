import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { GenerateIdeasResponse, Subject } from "@/types/api";

export function useSubjects(siteId: string | undefined, status?: string) {
  const params = new URLSearchParams();
  if (siteId) params.set("siteId", siteId);
  if (status) params.set("status", status);
  const qs = params.toString() ? `?${params}` : "";

  return useQuery({
    queryKey: ["subjects", siteId, status],
    queryFn: () => api.get<Subject[]>(`/subjects${qs}`),
    enabled: !!siteId,
  });
}

export function useSubject(subjectId: string | undefined) {
  return useQuery({
    queryKey: ["subjects", "detail", subjectId],
    queryFn: () => api.get<Subject>(`/subjects/${subjectId}`),
    enabled: !!subjectId,
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<Subject>("/subjects", body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["subjects", (vars as { siteId: string }).siteId],
      });
    },
  });
}

export function useUpdateSubject(subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.patch<Subject>(`/subjects/${subjectId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["subjects", "detail", subjectId] });
    },
  });
}

export function useGenerateIdeas(subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { count: number; provider?: string }) =>
      api.post<GenerateIdeasResponse>(
        `/subjects/${subjectId}/ideas/generate`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas", subjectId] });
    },
  });
}
