import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateSiteResponse, RotateKeyResponse, Site } from "@/types/api";

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: () => api.get<Site[]>("/sites"),
  });
}

export function useSite(siteId: string | undefined) {
  return useQuery({
    queryKey: ["sites", siteId],
    queryFn: () => api.get<Site>(`/sites/${siteId}`),
    enabled: !!siteId,
  });
}

export function useCreateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<CreateSiteResponse>("/sites", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sites"] }),
  });
}

export function useUpdateSite(siteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.patch<Site>(`/sites/${siteId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      qc.invalidateQueries({ queryKey: ["sites", siteId] });
    },
  });
}

export function useRotateApiKey(siteId: string) {
  return useMutation({
    mutationFn: () =>
      api.post<RotateKeyResponse>(`/sites/${siteId}/rotate-content-api-key`),
  });
}
