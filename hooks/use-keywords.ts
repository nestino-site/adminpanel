import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Keyword } from "@/types/api";

export function useKeywords(siteId: string | undefined) {
  const params = siteId ? `?siteId=${siteId}` : "";
  return useQuery({
    queryKey: ["keywords", siteId],
    queryFn: () => api.get<Keyword[]>(`/keywords${params}`),
    enabled: !!siteId,
  });
}
