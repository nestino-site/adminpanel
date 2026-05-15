import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Template } from "@/types/api";

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => api.get<Template[]>("/templates"),
  });
}

export function useTemplateMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["templates"] });

  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        api.post<Template>("/templates", body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: string;
        body: Record<string, unknown>;
      }) => api.patch<Template>(`/templates/${id}`, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete(`/templates/${id}`),
      onSuccess: invalidate,
    }),
  };
}
