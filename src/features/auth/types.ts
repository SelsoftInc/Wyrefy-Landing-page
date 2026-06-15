export type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  user_type: string;
  redirect_path: string;
  password_setup_required?: boolean;
};

export type LoginResponse = {
  next_step: "authenticated" | "verify_first_login" | "reset_first_login_password";
  user: User | null;
  message?: string;
};

export type AuthResponse = {
  user: User;
};

export type MessageResponse = {
  message: string;
};

export type GoogleStartResponse = {
  auth_url: string;
};

export type SignupPendingResponse = {
  message: string;
};

export type Plan = {
  id: string | null;
  name: string;
  slug: string;
  tenant_type: string;
  price_cents: number;
  billing_interval: string;
  included_credits: string;
  limits_json: {
    projects?: number | string;
    credits?: number | string;
    team_members?: number | string;
    [key: string]: unknown;
  };
  status: string;
  is_public: boolean;
  organization_id: string | null;
};

export type Subscription = {
  active: boolean;
  plan_slug: string | null;
  cancel_at_period_end: boolean;
  message: string;
};

export type BillingSummary = {
  owner_type: string;
  subscription_status: string;
  plan_slug: string | null;
  plan_name: string | null;
  plan_price_cents: number;
  billing_interval: string | null;
  included_credits: string;
  plan_limits_json: Record<string, unknown>;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  default_payment_method_saved: boolean;
  credit_balance: string;
  held_credits: string;
  lifetime_granted_credits: string;
  lifetime_used_credits: string;
  auto_top_up_enabled: boolean;
  auto_top_up_failure_state: string | null;
};

export type CheckoutSession = {
  checkout_url: string;
  stripe_checkout_session_id: string;
  message: string;
};

export type CustomerPortalSession = {
  portal_url: string;
};

export type Invoice = {
  id: string;
  status: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  currency: string;
  hosted_invoice_url: string | null;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
};

export type AutoTopUpSettings = {
  enabled: boolean;
  threshold_percentage: number;
  purchase_amount_cents: number;
  credit_amount: string;
  max_purchase_count_per_cycle: number;
  notification_emails: string[];
  notify_on_success: boolean;
  notify_on_failure: boolean;
  failure_state: string | null;
  last_failure_reason: string | null;
};

export type AutoRenewRequest = {
  auto_renew: boolean;
};

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string;
  allowed_email_domain: string;
  plan: string | null;
  seat_count: number;
  credits_used: string;
  credits_remaining: string;
  project_count: number;
  project_limit: number;
  projects_remaining: number;
  token_usage: number;
  compute_usage: number;
  status: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan: string | null;
  role: string;
  user_type: string;
  credits_used: string;
  credits_remaining: string;
  project_count: number;
  project_limit: number;
  projects_remaining: number;
  token_usage: number;
  compute_usage: number;
  status: string;
};

export type AdminMember = {
  user_id: string;
  name: string;
  email: string;
  role: string;
  usage: number;
  status: string;
};

export type OrganizationMember = {
  user_id: string;
  membership_id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  can_manage_billing: boolean;
  credit_used: string;
  token_usage: number;
  compute_usage: string;
  deleted_at: string | null;
};

export type MemberUsage = {
  user_id: string;
  name: string;
  token_usage: number;
  compute_usage: string;
  credit_used: string;
  cost_usd: string;
};

export type CurrentOrganization = {
  id: string;
  name: string;
  slug: string;
  allowed_email_domain: string;
  role: string;
  status: string;
  billing_contacts: Record<string, unknown>;
  security_defaults: Record<string, unknown>;
  member_defaults: Record<string, unknown>;
  retention_settings: Record<string, unknown>;
  can_manage_billing: boolean;
  can_manage_members: boolean;
  can_delete_organization: boolean;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  visibility: string;
  owner_type: string;
  owner_id: string;
  created_by_user_id: string;
  created_by_organization_role: string | null;
  current_workspace_id: string | null;
  current_artifact_version_id: string | null;
  current_design_ir_version_id: string | null;
  stack_target_json: Record<string, unknown>;
  workspace_metadata_json: Record<string, unknown>;
  export_status: string;
  last_generation_status: string | null;
  credit_used: string;
  token_usage: number;
  compute_seconds: string;
  usage_summary: ProjectUsage;
  workspace: ProjectWorkspace | null;
  can_update: boolean;
  can_delete: boolean;
  can_export: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectWorkspace = {
  id: string;
  status: string;
  workspace_kind: string;
  root_path_hint: string | null;
  s3_snapshot_key: string | null;
  preview_url: string | null;
  metadata_json: Record<string, unknown>;
};

export type ProjectArtifact = {
  id: string;
  version_number: number;
  status: string;
  artifact_kind: string;
  s3_key: string | null;
  file_tree_summary_json: Record<string, unknown>;
  package_json_hash: string | null;
  commit_hash: string | null;
  generation_id: string | null;
  created_at: string;
};

export type ProjectDownload = {
  available: boolean;
  status: string;
  message: string;
  artifact_id: string | null;
  download_url: string | null;
  expires_at: string | null;
};

export type ProjectUsage = {
  credit_used: string;
  token_usage: number;
  compute_seconds: string;
  generation_count: number;
  current_artifact_version_id: string | null;
};

export type ProjectLimits = {
  max_projects: number | null;
  max_active_projects: number | null;
  active_projects: number;
  total_projects: number;
  subscription_required: boolean;
  subscription_status: string | null;
};
