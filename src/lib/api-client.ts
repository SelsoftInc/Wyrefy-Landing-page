"use client";

export { API_BASE_URL } from "@/src/lib/api-config";
import { API_BASE_URL } from "@/src/lib/api-config";

type RequestOptions<TBody> = Omit<RequestInit, "body"> & {
  body?: TBody;
};

const REFRESH_PATH = "/auth/refresh";

export function csrfToken() {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("wyrefy_csrf_token="))
    ?.split("=")[1] ?? null;
}

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  return requestWithRefresh<TResponse, TBody>(path, options, true);
}

function errorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const detail = "detail" in data ? data.detail : null;
  const message = "message" in data ? data.message : null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = [];
    for (const item of detail) {
      if (item && typeof item === "object" && "msg" in item && typeof item.msg === "string") {
        messages.push(item.msg);
      } else if (typeof item === "string") {
        messages.push(item);
      }
    }
    return messages.join(", ") || "Request failed";
  }
  if (typeof message === "string") return message;
  return "Request failed";
}

function parseResponseBody(response: Response, text: string): unknown {
  if (!text) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return { message: "Received invalid JSON from the API." };
    }
  }
  return { message: text.trim() || "Request failed" };
}

async function requestWithRefresh<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody>,
  allowRefresh: boolean,
): Promise<TResponse> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }
  const csrf = csrfToken();
  if (csrf) {
    headers.set("x-csrf-token", decodeURIComponent(csrf));
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const data = parseResponseBody(response, text);
  if (response.status === 401 && allowRefresh && path !== REFRESH_PATH && !path.startsWith("/auth/login") && path !== "/auth/logout") {
    const refresh = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
      method: "POST",
      credentials: "include",
      headers: csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : undefined,
    });
    if (refresh.ok) {
      return requestWithRefresh<TResponse, TBody>(path, options, false);
    }
  }
  if (!response.ok) {
    if (path === "/auth/logout" && response.status === 401) {
      return { message: "Logged out" } as TResponse;
    }
    throw new Error(errorMessage(data));
  }
  return data as TResponse;
}
