"use client";

import { apiRequest } from "@/src/shared/api-client";

import type {
  AdminMember,
  AdminOrganization,
  AdminUser,
  AuthResponse,
  AutoTopUpSettings,
  AutoRenewRequest,
  CheckoutSession,
  BillingSummary,
  CurrentOrganization,
  CustomerPortalSession,
  GoogleStartResponse,
  Invoice,
  LoginResponse,
  MemberUsage,
  MessageResponse,
  OrganizationMember,
  Plan,
  SignupPendingResponse,
  Subscription,
} from "./types";

export function login(payload: { email: string; password: string }) {
  return apiRequest<LoginResponse, typeof payload>("/auth/login", { method: "POST", body: payload });
}

export function signup(payload: { email: string; password: string; full_name: string }) {
  return apiRequest<SignupPendingResponse, typeof payload>("/auth/signup", { method: "POST", body: payload });
}

export function verifySignup(payload: { email: string; code: string }) {
  return apiRequest<AuthResponse, typeof payload>("/auth/signup/verify", { method: "POST", body: payload });
}

export function resendSignup(payload: { email: string }) {
  return apiRequest<MessageResponse, typeof payload>("/auth/signup/resend", { method: "POST", body: payload });
}

export function me() {
  return apiRequest<AuthResponse>(`/auth/me?t=${Date.now()}`);
}

export function logout() {
  return apiRequest<MessageResponse>("/auth/logout", { method: "POST" });
}

export function forgotPassword(payload: { email: string }) {
  return apiRequest<MessageResponse, typeof payload>("/auth/forgot-password", { method: "POST", body: payload });
}

export function resetPassword(payload: { token: string; new_password: string; confirm_password: string }) {
  return apiRequest<MessageResponse, typeof payload>("/auth/reset-password", { method: "POST", body: payload });
}

export function completeFirstLogin(payload: { email: string; code: string; new_password: string }) {
  return apiRequest<AuthResponse, typeof payload>("/auth/first-login/complete", { method: "POST", body: payload });
}

export function setupPassword(payload: { new_password: string; confirm_password: string }) {
  return apiRequest<AuthResponse, typeof payload>("/auth/setup-password", { method: "POST", body: payload });
}

export function resendFirstLogin(payload: { email: string }) {
  return apiRequest<MessageResponse, typeof payload>("/auth/first-login/resend", { method: "POST", body: payload });
}


export function completeOrganizationOnboarding(payload: { token: string; plan_slug?: string }) {
  return apiRequest<AuthResponse, typeof payload>("/auth/organization-onboarding/complete", { method: "POST", body: payload });
}

export function completeOrganizationInvite(payload: { token: string; new_password: string; confirm_password: string; confirm_individual_conversion: boolean }) {
  return apiRequest<AuthResponse, typeof payload>("/auth/organization-invite/complete", { method: "POST", body: payload });
}

export function previewOrganizationInvite(token: string) {
  return apiRequest<{ email: string; organization_name: string; existing_individual_account: boolean }>(
    `/auth/organization-invite/preview?token=${encodeURIComponent(token)}`,
  );
}

export function startGoogleLogin() {
  return apiRequest<GoogleStartResponse>("/auth/google/start");
}

export function startGoogleSignup() {
  return apiRequest<GoogleStartResponse>("/auth/google/signup/start");
}

export function startGoogleInvite(token: string) {
  return apiRequest<GoogleStartResponse>(`/auth/google/invite/start?token=${encodeURIComponent(token)}&confirm_individual_conversion=true`);
}

export function confirmGoogle(payload: { state: string; confirm: boolean }) {
  return apiRequest<AuthResponse, typeof payload>("/auth/google/confirm", { method: "POST", body: payload });
}

export function publicPlans(tenantType?: "individual" | "organization") {
  const query = tenantType ? `?tenant_type=${tenantType}` : "";
  return apiRequest<Plan[]>(`/plans/public${query}`);
}

export function createSubscriptionCheckout(payload: { plan_slug: string }) {
  return apiRequest<CheckoutSession, typeof payload>("/billing/checkout/subscription", { method: "POST", body: payload });
}

export function createOrganizationSubscriptionCheckout(payload: { plan_slug: string }) {
  return apiRequest<CheckoutSession, typeof payload>("/billing/organization/checkout/subscription", { method: "POST", body: payload });
}

export function createCreditCheckout(payload: { purchase_amount_cents: number; credit_amount: string }) {
  return apiRequest<CheckoutSession, typeof payload>("/billing/checkout/credits", { method: "POST", body: payload });
}

export function createOrganizationCreditCheckout(payload: { purchase_amount_cents: number; credit_amount: string }) {
  return apiRequest<CheckoutSession, typeof payload>("/billing/organization/checkout/credits", { method: "POST", body: payload });
}

export function createCustomerPortal() {
  return apiRequest<CustomerPortalSession>("/billing/customer-portal", { method: "POST" });
}

export function createOrganizationCustomerPortal() {
  return apiRequest<CustomerPortalSession>("/billing/organization/customer-portal", { method: "POST" });
}

export function invoices() {
  return apiRequest<Invoice[]>("/billing/invoices");
}

export function organizationInvoices() {
  return apiRequest<Invoice[]>("/billing/organization/invoices");
}

export function autoTopUpSettings() {
  return apiRequest<AutoTopUpSettings>("/billing/auto-top-up");
}

export function organizationAutoTopUpSettings() {
  return apiRequest<AutoTopUpSettings>("/billing/organization/auto-top-up");
}

export function updateAutoTopUpSettings(payload: AutoTopUpSettings) {
  return apiRequest<AutoTopUpSettings, typeof payload>("/billing/auto-top-up", { method: "PATCH", body: payload });
}

export function updateOrganizationAutoTopUpSettings(payload: AutoTopUpSettings) {
  return apiRequest<AutoTopUpSettings, typeof payload>("/billing/organization/auto-top-up", { method: "PATCH", body: payload });
}

export function updateAutoRenew(payload: AutoRenewRequest) {
  return apiRequest<Subscription, typeof payload>("/billing/auto-renew", { method: "PATCH", body: payload });
}

export function updateOrganizationAutoRenew(payload: AutoRenewRequest) {
  return apiRequest<Subscription, typeof payload>("/billing/organization/auto-renew", { method: "PATCH", body: payload });
}

export function mySubscription() {
  return apiRequest<Subscription>("/billing/me");
}

export function billingSummary() {
  return apiRequest<BillingSummary>("/billing/summary");
}

export function organizationBillingSummary() {
  return apiRequest<BillingSummary>("/billing/organization/summary");
}

export function upsertPlan(payload: Omit<Plan, "id">) {
  return apiRequest<Plan, typeof payload>("/admin/plans", { method: "POST", body: payload });
}

export function adminPlans(scope: "public" | "custom" = "public", tenantType?: "individual" | "organization") {
  const tenantQuery = tenantType ? `&tenant_type=${tenantType}` : "";
  return apiRequest<Plan[]>(`/admin/plans?scope=${scope}${tenantQuery}`);
}

export function updatePlan(id: string, payload: Partial<Omit<Plan, "id">>) {
  return apiRequest<Plan, typeof payload>(`/admin/plans/${id}`, { method: "PATCH", body: payload });
}

export function archivePlan(id: string) {
  return apiRequest<MessageResponse, { confirmation: string }>(`/admin/plans/${id}`, { method: "DELETE", body: { confirmation: "ARCHIVE" } });
}

export function createOrganization(payload: {
  name: string;
  slug: string;
  allowed_email_domain: string;
  admin_email: string;
  admin_full_name: string;
  plan_slug: string;
}) {
  return apiRequest<{ organization_id: string; admin_user_id: string; onboarding_url: string; message: string }, typeof payload>(
    "/admin/organizations",
    { method: "POST", body: payload },
  );
}

export function adminOrganizations() {
  return apiRequest<AdminOrganization[]>("/admin/organizations");
}

export function adminOrganizationMembers(id: string) {
  return apiRequest<AdminMember[]>(`/admin/organizations/${id}/members`);
}

export function updateOrganization(id: string, payload: { name?: string; status?: string; plan_id?: string }) {
  return apiRequest<MessageResponse, typeof payload>(`/admin/organizations/${id}`, { method: "PATCH", body: payload });
}

export function suspendOrganization(id: string) {
  return apiRequest<MessageResponse>(`/admin/organizations/${id}/suspend`, { method: "POST" });
}

export function deleteOrganization(id: string) {
  return apiRequest<MessageResponse, { confirmation: string }>(`/admin/organizations/${id}`, { method: "DELETE", body: { confirmation: "DELETE" } });
}

export function adminUsers(type: "individual" | "platform_admin") {
  return apiRequest<AdminUser[]>(`/admin/users?type=${type}`);
}

export function addPlatformAdmin(payload: { email: string; full_name: string }) {
  return apiRequest<MessageResponse, typeof payload>("/admin/platform-admins", { method: "POST", body: payload });
}

export function updateAdminUser(id: string, payload: { full_name?: string; status?: string; plan_id?: string }) {
  return apiRequest<MessageResponse, typeof payload>(`/admin/users/${id}`, { method: "PATCH", body: payload });
}

export function suspendAdminUser(id: string) {
  return apiRequest<MessageResponse>(`/admin/users/${id}/suspend`, { method: "POST" });
}

export function deleteAdminUser(id: string) {
  return apiRequest<MessageResponse, { confirmation: string }>(`/admin/users/${id}`, { method: "DELETE", body: { confirmation: "DELETE" } });
}

export function updateAdminOrgMember(orgId: string, userId: string, payload: { role?: string; status?: string }) {
  return apiRequest<MessageResponse, typeof payload>(`/admin/organizations/${orgId}/members/${userId}`, { method: "PATCH", body: payload });
}

export function suspendAdminOrgMember(orgId: string, userId: string) {
  return apiRequest<MessageResponse>(`/admin/organizations/${orgId}/members/${userId}/suspend`, { method: "POST" });
}

export function deleteAdminOrgMember(orgId: string, userId: string) {
  return apiRequest<MessageResponse, { confirmation: string }>(`/admin/organizations/${orgId}/members/${userId}`, { method: "DELETE", body: { confirmation: "DELETE" } });
}

export function deleteMyAccount(payload: { confirmation: string }) {
  return apiRequest<MessageResponse, typeof payload>("/account/me", { method: "DELETE", body: payload });
}

export function updateProfile(payload: { full_name?: string; avatar_url?: string }) {
  return apiRequest<MessageResponse, typeof payload>("/account/me", { method: "PATCH", body: payload });
}

export function changePassword(payload: { current_password: string; new_password: string; confirm_password: string }) {
  return apiRequest<MessageResponse, typeof payload>("/account/me/change-password", { method: "POST", body: payload });
}


export function deleteCurrentOrganization(payload: { confirmation: string }) {
  return apiRequest<MessageResponse, typeof payload>("/organizations/current", { method: "DELETE", body: payload });
}

export function organizationMembers() {
  return apiRequest<OrganizationMember[]>("/organizations/current/members");
}

export function currentOrganization() {
  return apiRequest<CurrentOrganization>("/organizations/current");
}

export function inviteOrganizationMember(payload: { email: string; full_name: string; role: string }) {
  return apiRequest<MessageResponse, typeof payload>("/organizations/current/invites", { method: "POST", body: payload });
}

export function updateOrganizationMember(id: string, payload: { role?: string; status?: string }) {
  return apiRequest<MessageResponse, typeof payload>(`/organizations/current/members/${id}`, { method: "PATCH", body: payload });
}

export function setOrganizationMemberBillingAccess(id: string, payload: { can_manage_billing: boolean }) {
  return apiRequest<MessageResponse, typeof payload>(`/organizations/current/members/${id}/billing-access`, { method: "PATCH", body: payload });
}

export function suspendOrganizationMember(id: string) {
  return apiRequest<MessageResponse>(`/organizations/current/members/${id}/suspend`, { method: "POST" });
}

export function reinviteOrganizationMember(id: string) {
  return apiRequest<MessageResponse>(`/organizations/current/members/${id}/reinvite`, { method: "POST" });
}

export function deleteOrganizationMember(id: string) {
  return apiRequest<MessageResponse>(`/organizations/current/members/${id}`, { method: "DELETE" });
}

export function organizationMemberUsage(id: string) {
  return apiRequest<MemberUsage>(`/organizations/current/members/${id}/usage`);
}

export function enterpriseContact(payload: { name: string; email: string; company: string; message: string }) {
  return apiRequest<MessageResponse, typeof payload>("/contact/enterprise", { method: "POST", body: payload });
}

export * from "./projects-api";
