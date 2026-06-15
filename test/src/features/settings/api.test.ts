import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.hoisted(() => vi.fn());

vi.mock("@/src/shared/api-client", () => ({
  apiRequest: mockApiRequest,
}));

import {
  reauthenticate,
  authSessions,
  revokeAuthSession,
  connectedIdentities,
  updateNotifications,
  requestDataExport,
  deleteAccount,
  updateOrganizationProfile,
  updateOrganizationSecurity,
  updateOrganizationMemberDefaults,
  updateOrganizationRetention,
  deleteOrganization,
} from "@/src/features/settings/api";

describe("settings-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reauthenticate calls apiRequest with POST", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "Reauthenticated" });
    const result = await reauthenticate({ current_password: "pwd" });
    expect(mockApiRequest).toHaveBeenCalledWith("/account/me/reauthenticate", { method: "POST", body: { current_password: "pwd" } });
    expect(result).toEqual({ message: "Reauthenticated" });
  });

  it("authSessions calls apiRequest with GET", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    const result = await authSessions();
    expect(mockApiRequest).toHaveBeenCalledWith("/auth/sessions");
    expect(result).toEqual([]);
  });

  it("revokeAuthSession calls apiRequest with DELETE", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "Revoked" });
    const result = await revokeAuthSession("session_1");
    expect(mockApiRequest).toHaveBeenCalledWith("/auth/sessions/session_1", { method: "DELETE" });
    expect(result).toEqual({ message: "Revoked" });
  });

  it("connectedIdentities calls apiRequest with GET", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    const result = await connectedIdentities();
    expect(mockApiRequest).toHaveBeenCalledWith("/account/me/identities");
    expect(result).toEqual([]);
  });

  it("updateNotifications calls apiRequest with PATCH", async () => {
    const payload = { email_frequency: "daily" } as Record<string, unknown>;
    mockApiRequest.mockResolvedValueOnce(payload);
    const result = await updateNotifications(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/account/me/notifications", { method: "PATCH", body: payload });
    expect(result).toEqual(payload);
  });

  it("requestDataExport calls apiRequest with POST", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "Export started" });
    const result = await requestDataExport();
    expect(mockApiRequest).toHaveBeenCalledWith("/account/me/export", { method: "POST" });
    expect(result).toEqual({ message: "Export started" });
  });

  it("deleteAccount calls apiRequest with DELETE", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "Deleted" });
    const result = await deleteAccount({ confirmation: "delete" });
    expect(mockApiRequest).toHaveBeenCalledWith("/account/me", { method: "DELETE", body: { confirmation: "delete" } });
    expect(result).toEqual({ message: "Deleted" });
  });

  it("updateOrganizationProfile calls apiRequest with PATCH", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "Updated" });
    const result = await updateOrganizationProfile({ name: "New Org" });
    expect(mockApiRequest).toHaveBeenCalledWith("/organizations/current", { method: "PATCH", body: { name: "New Org" } });
    expect(result).toEqual({ message: "Updated" });
  });

  it("updateOrganizationSecurity calls apiRequest with PATCH", async () => {
    const payload = {} as Record<string, unknown>;
    mockApiRequest.mockResolvedValueOnce({ message: "Updated" });
    const result = await updateOrganizationSecurity(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/organizations/current/security", { method: "PATCH", body: payload });
    expect(result).toEqual({ message: "Updated" });
  });

  it("updateOrganizationMemberDefaults calls apiRequest with PATCH", async () => {
    const payload = {} as Record<string, unknown>;
    mockApiRequest.mockResolvedValueOnce({ message: "Updated" });
    const result = await updateOrganizationMemberDefaults(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/organizations/current/member-defaults", { method: "PATCH", body: payload });
    expect(result).toEqual({ message: "Updated" });
  });

  it("updateOrganizationRetention calls apiRequest with PATCH", async () => {
    const payload = {} as Record<string, unknown>;
    mockApiRequest.mockResolvedValueOnce({ message: "Updated" });
    const result = await updateOrganizationRetention(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/organizations/current/retention", { method: "PATCH", body: payload });
    expect(result).toEqual({ message: "Updated" });
  });

  it("deleteOrganization calls apiRequest with DELETE", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "Deleted" });
    const result = await deleteOrganization({ confirmation: "delete" });
    expect(mockApiRequest).toHaveBeenCalledWith("/organizations/current", { method: "DELETE", body: { confirmation: "delete" } });
    expect(result).toEqual({ message: "Deleted" });
  });
});
