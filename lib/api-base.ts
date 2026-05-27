export function normalizeApiBase(url: string) {
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  return `${trimmed}/api/v1`;
}

export const SERVER_API_BASE = normalizeApiBase(
  process.env.API_PROXY_TARGET ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://nestino-backend-production.up.railway.app/api/v1",
);

/** Browser uses same-origin /api/v1 (Next.js rewrite or route handlers) to avoid CORS. */
export function getBrowserApiBase() {
  return "/api/v1";
}

export function getApiBase() {
  if (typeof window !== "undefined") {
    return getBrowserApiBase();
  }
  return SERVER_API_BASE;
}
