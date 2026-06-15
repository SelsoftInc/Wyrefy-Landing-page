"use client";

import { apiRequest } from "@/src/shared/api-client";

import type {
  AdminTrendResponse,
  Announcement,
  AnnouncementPayload,
  ComputePricing,
  DashboardMetrics,
  EndpointAnalytics,
  ModelPricing,
  OrganizationComputeOverride,
  OrganizationAnalytics,
  ReportResult,
  RuntimeProvider,
  SupportTicket,
  UsageTrend,
} from "./types";

export function adminDashboard() {
  return apiRequest<DashboardMetrics>("/admin/dashboard");
}

export function endpointAnalytics(days = 30) {
  return apiRequest<EndpointAnalytics>(`/admin/analytics/endpoints?days=${days}`);
}

export function organizationAnalytics(days = 30) {
  return apiRequest<OrganizationAnalytics>(`/admin/analytics/organizations?days=${days}`);
}

export function usageTrends(days = 30) {
  return apiRequest<UsageTrend[]>(`/admin/analytics/usage-trends?days=${days}`);
}

export function tokenTrends(days = 30, params?: { provider?: string; model_name?: string }) {
  const query = new URLSearchParams({ days: String(days) });
  if (params?.provider) query.set("provider", params.provider);
  if (params?.model_name) query.set("model_name", params.model_name);
  return apiRequest<AdminTrendResponse>(`/admin/analytics/token-trends?${query.toString()}`);
}

export function sandboxTrends(days = 30, profileKey?: string) {
  const query = new URLSearchParams({ days: String(days) });
  if (profileKey) query.set("profile_key", profileKey);
  return apiRequest<AdminTrendResponse>(`/admin/analytics/sandbox-trends?${query.toString()}`);
}

export function modelPricing() {
  return apiRequest<ModelPricing[]>("/admin/pricing/models");
}

export function runtimeProviders() {
  return apiRequest<RuntimeProvider[]>("/admin/pricing/model-providers");
}

export function createModelPricing(payload: {
  provider: string;
  model_name: string;
  model_id: string;
  input_price_per_million: string;
  output_price_per_million: string;
  cache_read_price_per_million: string;
  cache_write_price_per_million: string;
  context_window_tokens?: number;
  metadata_json: Record<string, unknown>;
}) {
  return apiRequest<ModelPricing, typeof payload>("/admin/pricing/models", { method: "POST", body: payload });
}

export function updateModelPricing(id: string, payload: {
  model_name: string;
  input_price_per_million: string;
  output_price_per_million: string;
  cache_read_price_per_million: string;
  cache_write_price_per_million: string;
  context_window_tokens?: number;
  metadata_json: Record<string, unknown>;
}) {
  return apiRequest<ModelPricing, typeof payload>(`/admin/pricing/models/${id}`, { method: "PATCH", body: payload });
}

export function deprecateModelPricing(id: string) {
  return apiRequest<ModelPricing>(`/admin/pricing/models/${id}/deprecate`, { method: "POST" });
}

export function deleteModelPricing(id: string) {
  return apiRequest<{ message: string }>(`/admin/pricing/models/${id}`, { method: "DELETE" });
}

export function computePricing() {
  return apiRequest<ComputePricing[]>("/admin/pricing/compute");
}

export function computeOverrides() {
  return apiRequest<OrganizationComputeOverride[]>("/admin/pricing/compute-overrides");
}

export function createComputeOverride(payload: { organization_id: string; compute_profile_key: string }) {
  return apiRequest<OrganizationComputeOverride, typeof payload>("/admin/pricing/compute-overrides", { method: "POST", body: payload });
}

export function deprecateComputeOverride(id: string) {
  return apiRequest<OrganizationComputeOverride>(`/admin/pricing/compute-overrides/${id}/deprecate`, { method: "POST" });
}

export function createComputePricing(payload: {
  profile_key: string;
  display_name: string;
  runtime_image: string | null;
  vcpu_price_per_second: string;
  memory_gb_price_per_second: string;
  metadata_json: { vcpu: string; memory_gb: string };
}) {
  return apiRequest<ComputePricing, typeof payload>("/admin/pricing/compute", { method: "POST", body: payload });
}

export function deprecateComputePricing(id: string) {
  return apiRequest<ComputePricing>(`/admin/pricing/compute/${id}/deprecate`, { method: "POST" });
}

export function adminReport(kind: "mrr" | "usage" | "subscriptions") {
  return apiRequest<ReportResult>(`/admin/reports/${kind}`);
}

export function exportReport(kind: "mrr" | "usage" | "subscriptions" = "usage") {
  return apiRequest<ReportResult>(`/admin/reports/export?kind=${kind}`);
}

export function supportTickets() {
  return apiRequest<SupportTicket[]>("/admin/support/tickets");
}

export function supportTicket(id: string) {
  return apiRequest<SupportTicket>(`/admin/support/tickets/${id}`);
}

export function updateSupportTicket(id: string, payload: { status?: string; priority?: string }) {
  return apiRequest<SupportTicket, typeof payload>(`/admin/support/tickets/${id}`, { method: "PATCH", body: payload });
}

export function replySupportTicket(id: string, payload: { body: string; visibility: string }) {
  return apiRequest<{ message: string }, typeof payload>(`/admin/support/tickets/${id}/reply`, { method: "POST", body: payload });
}

export function announcements() {
  return apiRequest<Announcement[]>("/admin/announcements");
}

export function createAnnouncement(payload: AnnouncementPayload) {
  return apiRequest<Announcement, typeof payload>("/admin/announcements", { method: "POST", body: payload });
}

export function updateAnnouncement(id: string, payload: AnnouncementPayload) {
  return apiRequest<Announcement, typeof payload>(`/admin/announcements/${id}`, { method: "PATCH", body: payload });
}

export function deleteAnnouncement(id: string) {
  return apiRequest<{ message: string }, { confirmation: string }>(`/admin/announcements/${id}`, { method: "DELETE", body: { confirmation: "ARCHIVE" } });
}
