import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContentTask } from "@/types/api";

function getTasksPollInterval(tasks: ContentTask[] | undefined) {
  if (!tasks?.some((t) => t.status === "QUEUED" || t.status === "PROCESSING")) {
    return false;
  }
  return 5_000;
}

export function useContentTasks(siteId: string | undefined, status?: string) {
  const params = new URLSearchParams();
  if (siteId) params.set("siteId", siteId);
  const qs = params.toString() ? `?${params}` : "";

  return useQuery({
    queryKey: ["content-tasks", siteId, status ?? "all"],
    queryFn: async () => {
      const tasks = await api.get<ContentTask[]>(`/content-tasks${qs}`);
      if (!status) return tasks;
      return tasks.filter((t) => t.status === status);
    },
    enabled: !!siteId,
    refetchInterval: (query) => getTasksPollInterval(query.state.data),
  });
}

export function useRetryTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string | number) =>
      api.post<ContentTask>(`/content-tasks/${taskId}/retry`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-tasks"] });
    },
  });
}
