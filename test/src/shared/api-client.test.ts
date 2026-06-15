import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalFetch = globalThis.fetch;

function mockFetch(response: Partial<Response>, text?: string) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    text: () => Promise.resolve(text ?? JSON.stringify({})),
    ...response,
  });
}

let apiClient: typeof import("@/src/shared/api-client");

beforeEach(async () => {
  apiClient = await import("@/src/shared/api-client");
});

describe("csrfToken", () => {
  beforeEach(() => {
    document.cookie = "";
  });

  it("returns null when no csrf cookie exists", () => {
    expect(apiClient.csrfToken()).toBeNull();
  });
});

describe("apiRequest", () => {
  beforeEach(() => {
    mockFetch({});
    document.cookie = "";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("makes a GET request to the correct URL", async () => {
    mockFetch({ ok: true, status: 200 }, JSON.stringify({ data: "ok" }));
    const result = await apiClient.apiRequest("/test");

    expect(result).toEqual({ data: "ok" });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("includes JSON body when data is provided", async () => {
    await apiClient.apiRequest("/test", {
      method: "POST",
      body: { name: "test" },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "test" }),
        credentials: "include",
      }),
    );
  });

  it("throws an error when response is not ok", async () => {
    mockFetch(
      { ok: false, status: 400 },
      JSON.stringify({ detail: "Bad request" }),
    );

    await expect(apiClient.apiRequest("/fail")).rejects.toThrow("Bad request");
  });

  it("handles error response with message field", async () => {
    mockFetch(
      { ok: false, status: 400 },
      JSON.stringify({ message: "Something went wrong" }),
    );

    await expect(apiClient.apiRequest("/fail")).rejects.toThrow("Something went wrong");
  });

  it("handles non-JSON error responses", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ "content-type": "text/plain" }),
      text: () => Promise.resolve("Internal Server Error"),
    });

    await expect(apiClient.apiRequest("/error")).rejects.toThrow("Internal Server Error");
  });

  it("handles 401 with refresh and retries the original request", async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      callCount++;
      if (url.includes("/auth/refresh")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          text: () => Promise.resolve(JSON.stringify({})),
        });
      }
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 401,
          headers: new Headers({ "content-type": "application/json" }),
          text: () => Promise.resolve(JSON.stringify({ detail: "Unauthorized" })),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: () => Promise.resolve(JSON.stringify({ data: "retried" })),
      });
    });

    const result = await apiClient.apiRequest("/protected");
    expect(result).toEqual({ data: "retried" });
  });
});
