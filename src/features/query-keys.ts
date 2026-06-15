type OwnerType = "individual" | "organization";

export const queryKeys = {
  publicPlans: (tenantType: OwnerType) => ["plans", tenantType] as const,
  invitePreview: (token: string) => ["organization-invite-preview", token] as const,
  currentOrganization: (userId: string) => ["current-organization", userId] as const,
  organizationMembers: (organizationId: string) => ["organization-members", organizationId] as const,
  organizationMemberUsage: (organizationId: string, memberUserId: string) =>
    ["member-usage", organizationId, memberUserId] as const,
  projectList: (tenantType: OwnerType, scopeId: string) => ["projects", tenantType, scopeId] as const,
  projectLimits: (tenantType: OwnerType, scopeId: string) => ["project-limits", tenantType, scopeId] as const,
  projectDetail: (projectId: string) => ["project", projectId] as const,
  billingSummary: (ownerType: OwnerType, scopeId: string) => ["billing-summary", ownerType, scopeId] as const,
  billingInvoices: (ownerType: OwnerType, scopeId: string) => ["billing-invoices", ownerType, scopeId] as const,
  billingAutoTopUp: (ownerType: OwnerType, scopeId: string) => ["billing-auto-top-up", ownerType, scopeId] as const,
  billingCheckoutReconcile: (ownerType: OwnerType, scopeId: string, checkoutSessionId: string) =>
    ["billing-checkout-reconcile", ownerType, scopeId, checkoutSessionId] as const,
  sandbox: (projectId: string) => ["sandbox", projectId] as const,
  previewUrl: (projectId: string) => ["preview-url", projectId] as const,
  projectAgentHistory: (projectId: string) => ["project-agent-history", projectId] as const,
  projectDownload: (projectId: string) => ["project-download", projectId] as const,
  projectAttachments: (projectId: string) => ["project-attachments", projectId] as const,
  figmaConnections: (userId: string) => ["figma-connections", userId] as const,
  runtimeModels: () => ["runtime-models"] as const,
};
