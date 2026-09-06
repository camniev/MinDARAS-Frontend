// src/lib/api-client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5226";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<TResponse>(path: string, options: RequestInit): Promise<TResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new ApiError(message, res.status);
  }

  // handle endpoints that return 204/empty body
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as TResponse;
}

export function apiPost<TResponse, TBody = unknown>(path: string, body: TBody) {
  return request<TResponse>(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiGet<TResponse>(path: string) {
  return request<TResponse>(path, { method: "GET" });
}