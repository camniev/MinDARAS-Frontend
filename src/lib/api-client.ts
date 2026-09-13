// src/lib/api-client.ts — full rewrite
import { getAccessToken, setAccessToken } from "@/lib/auth-token-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5226";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

let refreshPromise: Promise<string | null> | null = null;

// Ensures concurrent 401s only trigger ONE refresh call, not one per failed request.
async function refreshTokenOnce(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setAccessToken(null);
        return null;
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken as string;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

type RequestOptions = RequestInit & { skipAuthRetry?: boolean };

async function request<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !options.skipAuthRetry) {
    const newToken = await refreshTokenOnce();
    if (newToken) {
      // retry exactly once with the fresh token — skipAuthRetry prevents an infinite loop
      // if the retry itself somehow gets another 401
      return request<TResponse>(path, { ...options, skipAuthRetry: true });
    }
    // refresh failed — session is genuinely over
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let fieldErrors: Record<string, string[]> | undefined;
    try {
      const body = await res.json();
      if (body?.errors) {
        fieldErrors = body.errors;
        message = body.title ?? message;
      } else {
        message = body?.message ?? message;
      }
    } catch {
      // not JSON — keep generic message
    }
    throw new ApiError(message, res.status, fieldErrors);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as TResponse;
}

export function apiPost<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  options?: RequestOptions,
) {
  return request<TResponse>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined, ...options });
}

export function apiPut<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  options?: RequestOptions,
) {
  return request<TResponse>(path, { method: "PUT", body: JSON.stringify(body), ...options });
}

export function apiGet<TResponse>(path: string, options?: RequestOptions) {
  return request<TResponse>(path, { method: "GET", ...options });
}

export async function apiUploadFile(path: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // not JSON
    }
    throw new ApiError(message, res.status);
  }

  return res.json();
}