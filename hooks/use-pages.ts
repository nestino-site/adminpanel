import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import type { ContentPreview, Page, PublishResult } from "@/types/api";

const TERMINAL_PIPELINE = new Set(["READY", "FAILED"]);

function getPollInterval(elapsedMs: number, pipelineStatus?: string) {
  if (!pipelineStatus || TERMINAL_PIPELINE.has(pipelineStatus)) return false;
  return elapsedMs > 120_000 ? 15_000 : 5_000;
}

export function usePages(
  siteId: string | undefined,
  filters?: { status?: string; language?: string },
) {
  const params = new URLSearchParams();
  if (siteId) params.set("siteId", siteId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.language) params.set("language", filters.language);
  const qs = params.toString() ? `?${params}` : "";

  return useQuery({
    queryKey: ["pages", siteId, filters],
    queryFn: () => api.get<Page[]>(`/pages${qs}`),
    enabled: !!siteId,
  });
}

export function usePage(pageId: string | undefined) {
  const [startedAt] = useState(() => Date.now());
  const query = useQuery({
    queryKey: ["pages", "detail", pageId],
    queryFn: () => api.get<Page>(`/pages/${pageId}`),
    enabled: !!pageId,
    refetchInterval: (q) =>
      getPollInterval(Date.now() - startedAt, q.state.data?.pipelineStatus),
  });
  return query;
}

export function usePageMutations(pageId: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["pages", "detail", pageId] });

  return {
    generate: useMutation({
      mutationFn: (reset?: boolean) =>
        api.post(
          `/pages/${pageId}/generate-content${reset ? "?resetCheckpoint=true" : ""}`,
        ),
      onSuccess: invalidate,
    }),
    publish: useMutation({
      mutationFn: () => api.post<PublishResult>(`/pages/${pageId}/publish`),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        api.patch<Page>(`/pages/${pageId}`, body),
      onSuccess: invalidate,
    }),
  };
}

export function usePagePreview(pageId: string | undefined, siteId: string) {
  const siteApiKey = useAuthStore((s) => s.getSiteApiKey(siteId));
  return useQuery({
    queryKey: ["content-preview", pageId],
    queryFn: () =>
      apiFetch<ContentPreview>(`/content/${pageId}/preview`, {}, siteApiKey),
    enabled: !!pageId && !!siteApiKey,
  });
}

export function usePageLogs(pageId: string | undefined, siteId: string) {
  const siteApiKey = useAuthStore((s) => s.getSiteApiKey(siteId));
  return useQuery({
    queryKey: ["content-logs", pageId],
    queryFn: () =>
      apiFetch<unknown[]>(`/content/${pageId}/logs`, {}, siteApiKey),
    enabled: !!pageId && !!siteApiKey,
  });
}
