import type { CreateKeywordBody, CreatePageBody } from "@/types/api";
import {
  computeSlug,
  computeTitle,
  type GuideType,
} from "@/lib/guide-presets";

export type GuideStepId =
  | "createKeyword"
  | "createPage"
  | "generateContent"
  | "patchMeta"
  | "completePipeline"
  | "retryImage"
  | "publish";

export type StepStatus = "idle" | "loading" | "success" | "error";

export interface GuideFormState {
  guideType: GuideType;
  presetKey: string;
  country: string;
  city: string;
  keyword: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  siteId: number;
  priority: number;
  resetCheckpoint: boolean;
  autoPoll: boolean;
  autoPublish: boolean;
}

export interface WorkflowIds {
  keywordId: string | null;
  pageId: string | null;
}

export interface RequestLogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number | null;
  requestBody?: unknown;
  response?: unknown;
  error?: string;
}

export const STEP_DEFINITIONS: Record<
  GuideStepId,
  { method: string; pathTemplate: string; label: string }
> = {
  createKeyword: {
    method: "POST",
    pathTemplate: "/keywords",
    label: "Create Keyword",
  },
  createPage: {
    method: "POST",
    pathTemplate: "/pages",
    label: "Create Page",
  },
  generateContent: {
    method: "POST",
    pathTemplate: "/pages/:id/generate-content",
    label: "Start Generation",
  },
  patchMeta: {
    method: "PATCH",
    pathTemplate: "/pages/:id",
    label: "Patch Meta",
  },
  completePipeline: {
    method: "POST",
    pathTemplate: "/pages/:id/complete-pipeline",
    label: "Complete Pipeline",
  },
  retryImage: {
    method: "POST",
    pathTemplate: "/pages/:id/retry-image-generation",
    label: "Retry Image",
  },
  publish: {
    method: "POST",
    pathTemplate: "/pages/:id/publish",
    label: "Publish",
  },
};

export function resolvePath(
  step: GuideStepId,
  pageId?: string | null,
  resetCheckpoint?: boolean,
): string {
  const def = STEP_DEFINITIONS[step];
  let path = def.pathTemplate;
  if (pageId) {
    path = path.replace(":id", pageId);
  }
  if (step === "generateContent" && resetCheckpoint) {
    path += "?resetCheckpoint=true";
  }
  return path;
}

export function buildKeywordBody(form: GuideFormState): CreateKeywordBody {
  return {
    siteId: form.siteId,
    keyword: form.keyword,
    language: "EN",
    intent: "COMMERCIAL",
    priority: form.priority,
    targetUrl: form.slug,
  };
}

export function buildPageBody(
  form: GuideFormState,
  keywordId: string | null,
): CreatePageBody {
  return {
    siteId: form.siteId,
    keywordId: keywordId ? Number(keywordId) : 0,
    slug: form.slug,
    language: "EN",
    title: form.title,
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
  };
}

export function buildPatchMetaBody(form: GuideFormState) {
  return {
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
  };
}

export function buildStepBody(
  step: GuideStepId,
  form: GuideFormState,
  ids: WorkflowIds,
): unknown {
  switch (step) {
    case "createKeyword":
      return buildKeywordBody(form);
    case "createPage":
      return buildPageBody(form, ids.keywordId);
    case "generateContent":
    case "completePipeline":
    case "retryImage":
    case "publish":
      return {};
    case "patchMeta":
      return buildPatchMetaBody(form);
    default:
      return {};
  }
}

export function mergeStepBody(
  step: GuideStepId,
  form: GuideFormState,
  ids: WorkflowIds,
  override?: unknown,
): unknown {
  const base = buildStepBody(step, form, ids);
  if (!override || typeof override !== "object") return base;
  return { ...(base as object), ...(override as object) };
}

export function reverseMapJsonToForm(
  step: GuideStepId,
  parsed: Record<string, unknown>,
): Partial<GuideFormState> {
  const updates: Partial<GuideFormState> = {};

  if (step === "createKeyword") {
    if (typeof parsed.keyword === "string") updates.keyword = parsed.keyword;
    if (typeof parsed.targetUrl === "string") updates.slug = parsed.targetUrl;
    if (typeof parsed.priority === "number") updates.priority = parsed.priority;
    if (typeof parsed.siteId === "number") updates.siteId = parsed.siteId;
  }

  if (step === "createPage" || step === "patchMeta") {
    if (typeof parsed.slug === "string") updates.slug = parsed.slug;
    if (typeof parsed.title === "string") updates.title = parsed.title;
    if (typeof parsed.metaTitle === "string") updates.metaTitle = parsed.metaTitle;
    if (typeof parsed.metaDescription === "string") {
      updates.metaDescription = parsed.metaDescription;
    }
    if (typeof parsed.siteId === "number") updates.siteId = parsed.siteId;
  }

  if (Object.keys(updates).length === 0) return updates;

  if (updates.slug && !updates.title) {
    // keep slug/title in sync when possible
  }

  return updates;
}

export function recomputeSlugFromForm(form: GuideFormState): string {
  if (form.guideType === "country") {
    return computeSlug("country", form.country);
  }
  return computeSlug("city", form.country, form.city);
}

export function recomputeTitleFromForm(form: GuideFormState): string {
  return computeTitle(
    form.guideType,
    form.country,
    form.guideType === "city" ? form.city : undefined,
  );
}

export function createLogEntry(
  partial: Omit<RequestLogEntry, "id" | "timestamp">,
): RequestLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

export function snippetResponse(response: unknown, error?: string): string {
  if (error) return error.slice(0, 120);
  if (response == null) return "—";
  const str = JSON.stringify(response);
  return str.length > 120 ? `${str.slice(0, 120)}…` : str;
}
