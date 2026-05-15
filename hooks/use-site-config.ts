import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SiteConfig } from "@/types/api";

export function useSiteConfig(siteId: string | undefined) {
  return useQuery({
    queryKey: ["site-config", siteId],
    queryFn: () => api.get<SiteConfig>(`/site-configs/${siteId}`),
    enabled: !!siteId,
  });
}

export function useUpdateSiteConfig(siteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SiteConfig>) =>
      api.patch<SiteConfig>(`/site-configs/${siteId}`, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["site-config", siteId] }),
  });
}
