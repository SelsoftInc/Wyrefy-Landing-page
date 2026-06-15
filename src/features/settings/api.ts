"use client";

import { apiRequest } from "@/src/shared/api-client";

import type {
  AuthSession,
  ConnectedIdentity,
  MessageResponse,
  NotificationSettings,
  OrganizationMemberDefaults,
  OrganizationRetentionSettings,
  OrganizationSecurityDefaults,
} from "./types";

export function reauthenticate(payload: { current_password: string }) {
  return apiRequest<MessageResponse, typeof payload>("/account/me/reauthenticate", { method: "POST", body: payload });
}

export function authSessions() {
  return apiRequest<AuthSession[]>("/auth/sessions");
}

export function revokeAuthSession(id: string) {
  return apiRequest<MessageResponse>(`/auth/sessions/${id}`, { method: "DELETE" });
}

export function connectedIdentities() {
  return apiRequest<ConnectedIdentity[]>("/account/me/identities");
}

export function updateNotifications(payload: NotificationSettings) {
  return apiRequest<NotificationSettings, typeof payload>("/account/me/notifications", { method: "PATCH", body: payload });
}

export function requestDataExport() {
  return apiRequest<MessageResponse>("/account/me/export", { method: "POST" });
}

export function deleteAccount(payload: { confirmation: string }) {
  return apiRequest<MessageResponse, typeof payload>("/account/me", { method: "DELETE", body: payload });
}

export function updateOrganizationProfile(payload: { name?: string; billing_contacts?: Record<string, unknown> }) {
  return apiRequest<MessageResponse, typeof payload>("/organizations/current", { method: "PATCH", body: payload });
}

export function updateOrganizationSecurity(payload: OrganizationSecurityDefaults) {
  return apiRequest<MessageResponse, typeof payload>("/organizations/current/security", { method: "PATCH", body: payload });
}

export function updateOrganizationMemberDefaults(payload: OrganizationMemberDefaults) {
  return apiRequest<MessageResponse, typeof payload>("/organizations/current/member-defaults", { method: "PATCH", body: payload });
}

export function updateOrganizationRetention(payload: OrganizationRetentionSettings) {
  return apiRequest<MessageResponse, typeof payload>("/organizations/current/retention", { method: "PATCH", body: payload });
}

export function deleteOrganization(payload: { confirmation: string }) {
  return apiRequest<MessageResponse, typeof payload>("/organizations/current", { method: "DELETE", body: payload });
}
