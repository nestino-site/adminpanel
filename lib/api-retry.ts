import { ApiRequestError, apiFetch } from "@/lib/api";

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown): boolean {
  if (error instanceof ApiRequestError) {
    if (error.statusCode === 401) return false;
    if (error.statusCode >= 400 && error.statusCode < 500) return false;
    return error.statusCode >= 500;
  }
  return true;
}

export async function apiFetchWithRetry<T>(
  path: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {},
): Promise<T> {
  const maxAttempts = retryOptions.maxAttempts ?? 3;
  const baseDelayMs = retryOptions.baseDelayMs ?? 1000;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await apiFetch<T>(path, options);
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !isRetryable(error)) {
        throw error;
      }
      await sleep(baseDelayMs * attempt);
    }
  }

  throw lastError;
}
