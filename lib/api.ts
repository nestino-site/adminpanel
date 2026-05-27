import type { ApiError } from "@/types/api";

function normalizeApiBase(url: string) {
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  return `${trimmed}/api/v1`;
}

const SERVER_API_BASE = normalizeApiBase(
  process.env.API_PROXY_TARGET ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://nestino-backend-production.up.railway.app/api/v1",
);

/** Browser uses same-origin /api/v1 (Next.js rewrite → backend) to avoid CORS on Vercel. */
function getApiBase() {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  return SERVER_API_BASE;
}

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export class ApiRequestError extends Error {
  statusCode: number;
  path?: string;

  constructor(message: string, statusCode: number, path?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.path = path;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  siteApiKey?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (siteApiKey) {
    headers.set("X-Site-Api-Key", siteApiKey);
  }

  let res: Response;
  try {
    res = await fetch(`${getApiBase()}${path}`, { ...options, headers });
  } catch {
    throw new ApiRequestError(
      "Cannot reach API server — check your connection and that the backend is running.",
      0,
      path,
    );
  }

  if (res.status === 401) {
    const isLogin = path.includes("/identity/login");
    if (!isLogin) {
      accessToken = null;
      onUnauthorized?.();
    }
    throw new ApiRequestError("Unauthorized", 401, path);
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Partial<ApiError>;
    throw new ApiRequestError(
      err.message ?? res.statusText,
      res.status,
      err.path ?? path,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
