import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SeoMetric } from "@/types/api";

export function useSeoQuickWins(siteId: string | undefined) {
  return useQuery({
    queryKey: ["seo", "quick-wins", siteId],
    queryFn: () => api.get<unknown[]>(`/seo-strategy/${siteId}/quick-wins`),
    enabled: !!siteId,
  });
}

export function useSeoCannibalization(siteId: string | undefined) {
  return useQuery({
    queryKey: ["seo", "cannibalization", siteId],
    queryFn: () =>
      api.get<unknown[]>(`/seo-strategy/${siteId}/cannibalization`),
    enabled: !!siteId,
  });
}

export function useSeoOrphans(siteId: string | undefined) {
  return useQuery({
    queryKey: ["seo", "orphans", siteId],
    queryFn: () => api.get<unknown[]>(`/seo-strategy/${siteId}/keyword-orphans`),
    enabled: !!siteId,
  });
}

export function useSeoGeoScores(siteId: string | undefined) {
  return useQuery({
    queryKey: ["seo", "geo-scores", siteId],
    queryFn: () => api.get<unknown[]>(`/seo-strategy/${siteId}/geo-scores`),
    enabled: !!siteId,
  });
}

export function useSeoMetrics(siteId: string | undefined, days = 30) {
  return useQuery({
    queryKey: ["seo-metrics", siteId, days],
    queryFn: () =>
      api.get<SeoMetric[]>(`/seo-metrics?siteId=${siteId}&days=${days}`),
    enabled: !!siteId,
  });
}
