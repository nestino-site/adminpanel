"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetchWithRetry } from "@/lib/api-retry";
import {
  createDefaultFormState,
  getPreviewUrl,
} from "@/lib/guide-presets";
import {
  createLogEntry,
  mergeStepBody,
  resolvePath,
  reverseMapJsonToForm,
  type GuideFormState,
  type GuideStepId,
  type RequestLogEntry,
  type StepStatus,
  type WorkflowIds,
} from "@/lib/guide-workflow";
import type { Keyword, Page, PublishResult } from "@/types/api";

const TERMINAL_PIPELINE = new Set(["READY", "FAILED"]);

export function useGuidePagePoll(
  pageId: string | null | undefined,
  autoPoll: boolean,
) {
  return useQuery({
    queryKey: ["pages", "detail", pageId, "guide-poll"],
    queryFn: () => apiFetchWithRetry<Page>(`/pages/${pageId}`),
    enabled: !!pageId,
    refetchInterval: (query) => {
      if (!autoPoll || !pageId) return false;
      const status = query.state.data?.pipelineStatus;
      if (!status || TERMINAL_PIPELINE.has(status)) return false;
      return 10_000;
    },
  });
}

export function useGuideCreator(siteId: string) {
  const numericSiteId = Number(siteId) || 2;
  const qc = useQueryClient();
  const autoPublishFired = useRef(false);

  const [form, setForm] = useState<GuideFormState>(() =>
    createDefaultFormState(numericSiteId),
  );
  const [ids, setIds] = useState<WorkflowIds>({
    keywordId: null,
    pageId: null,
  });
  const [stepStatus, setStepStatus] = useState<
    Record<GuideStepId, StepStatus>
  >({
    createKeyword: "idle",
    createPage: "idle",
    generateContent: "idle",
    patchMeta: "idle",
    completePipeline: "idle",
    retryImage: "idle",
    publish: "idle",
  });
  const [requestLog, setRequestLog] = useState<RequestLogEntry[]>([]);
  const [jsonOverrides, setJsonOverrides] = useState<
    Partial<Record<GuideStepId, unknown>>
  >({});
  const [resumedExisting, setResumedExisting] = useState(false);
  const [published, setPublished] = useState(false);

  const { data: page, refetch: refetchPage } = useGuidePagePoll(
    ids.pageId,
    form.autoPoll,
  );

  const appendLog = useCallback((entry: RequestLogEntry) => {
    setRequestLog((prev) => [entry, ...prev]);
  }, []);

  const setStep = useCallback((step: GuideStepId, status: StepStatus) => {
    setStepStatus((prev) => ({ ...prev, [step]: status }));
  }, []);

  const updateForm = useCallback((updates: Partial<GuideFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateJsonOverride = useCallback(
    (step: GuideStepId, value: unknown, syncForm = true) => {
      setJsonOverrides((prev) => ({ ...prev, [step]: value }));
      if (syncForm && value && typeof value === "object") {
        const mapped = reverseMapJsonToForm(
          step,
          value as Record<string, unknown>,
        );
        if (Object.keys(mapped).length > 0) {
          setForm((prev) => ({ ...prev, ...mapped }));
        }
      }
    },
    [form],
  );

  const executeStep = useCallback(
    async (step: GuideStepId) => {
      setStep(step, "loading");
      const path = resolvePath(
        step,
        ids.pageId,
        step === "generateContent" ? form.resetCheckpoint : undefined,
      );
      const method = step === "patchMeta" ? "PATCH" : "POST";
      const body = mergeStepBody(step, form, ids, jsonOverrides[step]);

      try {
        let response: unknown;
        if (method === "PATCH") {
          response = await apiFetchWithRetry(path, {
            method: "PATCH",
            body: JSON.stringify(body),
          });
        } else {
          response = await apiFetchWithRetry(path, {
            method: "POST",
            body: JSON.stringify(body),
          });
        }

        appendLog(
          createLogEntry({
            method,
            path,
            status: 200,
            requestBody: body,
            response,
          }),
        );

        if (step === "createKeyword") {
          const kw = response as Keyword;
          setIds((prev) => ({ ...prev, keywordId: String(kw.id) }));
        }
        if (step === "createPage") {
          const pg = response as Page;
          setIds((prev) => ({ ...prev, pageId: String(pg.id) }));
          qc.invalidateQueries({ queryKey: ["pages", siteId] });
        }
        if (
          step === "generateContent" ||
          step === "completePipeline" ||
          step === "retryImage" ||
          step === "patchMeta"
        ) {
          qc.invalidateQueries({ queryKey: ["pages", "detail", ids.pageId] });
          await refetchPage();
        }
        if (step === "publish") {
          const result = response as PublishResult;
          if (result.published) {
            setPublished(true);
            toast.success("Published!", {
              description: getPreviewUrl(form.siteId, form.slug),
              action: {
                label: "Open",
                onClick: () =>
                  window.open(getPreviewUrl(form.siteId, form.slug), "_blank"),
              },
            });
          } else {
            toast.warning(result.skippedReason ?? "Publish skipped");
          }
        }

        setStep(step, "success");
        return response;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Request failed";
        appendLog(
          createLogEntry({
            method,
            path,
            status:
              error instanceof Error && "statusCode" in error
                ? (error as { statusCode: number }).statusCode
                : null,
            requestBody: body,
            error: message,
          }),
        );
        setStep(step, "error");
        toast.error(message);
        throw error;
      }
    },
    [
      appendLog,
      form,
      ids,
      jsonOverrides,
      qc,
      refetchPage,
      setStep,
      siteId,
    ],
  );

  const pollStatus = useCallback(async () => {
    if (!ids.pageId) return;
    setStep("generateContent", "loading");
    try {
      const response = await apiFetchWithRetry<Page>(`/pages/${ids.pageId}`);
      appendLog(
        createLogEntry({
          method: "GET",
          path: `/pages/${ids.pageId}`,
          status: 200,
          response,
        }),
      );
      qc.setQueryData(["pages", "detail", ids.pageId, "guide-poll"], response);
      setStep("generateContent", "success");
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Poll failed";
      appendLog(
        createLogEntry({
          method: "GET",
          path: `/pages/${ids.pageId}`,
          status: null,
          error: message,
        }),
      );
      setStep("generateContent", "error");
      toast.error(message);
    }
  }, [appendLog, ids.pageId, qc, setStep]);

  const resumeExistingPage = useCallback(
    (pageId: string, keywordId?: string) => {
      setIds({ pageId, keywordId: keywordId ?? null });
      setStepStatus({
        createKeyword: keywordId ? "success" : "idle",
        createPage: "success",
        generateContent: "idle",
        patchMeta: "idle",
        completePipeline: "idle",
        retryImage: "idle",
        publish: "idle",
      });
      setResumedExisting(true);
    },
    [],
  );

  const selectExistingKeyword = useCallback((keywordId: string) => {
    setIds((prev) => ({ ...prev, keywordId }));
    setStepStatus((prev) => ({ ...prev, createKeyword: "success" }));
  }, []);

  const clearKeywordSelection = useCallback(() => {
    setIds((prev) => ({ ...prev, keywordId: null }));
    setStepStatus((prev) => ({ ...prev, createKeyword: "idle" }));
  }, []);

  useEffect(() => {
    autoPublishFired.current = false;
  }, [ids.pageId]);

  useEffect(() => {
    if (
      !form.autoPublish ||
      !ids.pageId ||
      page?.pipelineStatus !== "READY" ||
      published ||
      autoPublishFired.current
    ) {
      return;
    }
    autoPublishFired.current = true;
    executeStep("publish").catch(() => {
      autoPublishFired.current = false;
    });
  }, [
    executeStep,
    form.autoPublish,
    ids.pageId,
    page?.pipelineStatus,
    published,
  ]);

  return {
    form,
    setForm: updateForm,
    ids,
    stepStatus,
    requestLog,
    jsonOverrides,
    updateJsonOverride,
    page,
    published,
    resumedExisting,
    executeStep,
    pollStatus,
    resumeExistingPage,
    selectExistingKeyword,
    clearKeywordSelection,
    refetchPage,
  };
}

export type GuideCreatorState = ReturnType<typeof useGuideCreator>;
