import { describe, expect, it } from "vitest";

import { routeForUser } from "@/src/features/auth/routing";

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "u1",
    email: "test@test.com",
    full_name: "Test User",
    role: "individual_user",
    status: "active",
    user_type: "individual",
    redirect_path: null,
    password_setup_required: false,
    ...overrides,
  } as Parameters<typeof routeForUser>[0];
}

describe("routeForUser", () => {
  it("redirects /dashboard to /individual/dashboard", () => {
    expect(routeForUser(makeUser({ redirect_path: "/dashboard" }))).toBe("/individual/dashboard");
  });

  it("rewrites /dashboard/ paths to /individual/", () => {
    expect(routeForUser(makeUser({ redirect_path: "/dashboard/projects" }))).toBe("/individual/projects");
  });

  it("returns custom redirect path as-is when it does not start with /dashboard", () => {
    expect(routeForUser(makeUser({ redirect_path: "/custom/path" }))).toBe("/custom/path");
  });

  it("returns platform admin dashboard for platform_admin role", () => {
    expect(routeForUser(makeUser({ role: "platform_admin", redirect_path: null }))).toBe("/platform_admin/dashboard");
  });

  it("returns individual dashboard for individual_user with no redirect", () => {
    expect(routeForUser(makeUser({ role: "individual_user", redirect_path: null }))).toBe("/individual/dashboard");
  });

  it("returns individual dashboard for user with empty redirect_path", () => {
    expect(routeForUser(makeUser({ redirect_path: "" }))).toBe("/individual/dashboard");
  });
});
