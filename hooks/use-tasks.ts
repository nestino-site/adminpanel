import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContentTask } from "@/types/api";

export function useContentTasks(siteId: string | undefined, status?: string) {
  const params = new URLSearchParams();
  if (siteId) params.set("siteId", siteId);
  const qs = params.toString() ? `?${params}` : "";

  return useQuery({
    queryKey: ["content-tasks", siteId],
    queryFn: async () => {
      const tasks = await api.get<ContentTask[]>(`/content-tasks${qs}`);
      if (!status) return tasks;
      return tasks.filter((t) => t.status === status);
    },
    enabled: !!siteId,
  });
}
