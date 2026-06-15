export type DashboardMetrics = {
  users: number;
  organizations: number;
  active_subscriptions: number;
  mrr_cents: number;
  arr_cents: number;
  token_usage: number;
  llm_cost_usd: string;
  sandbox_seconds: string;
  sandbox_cost_usd: string;
  open_support_tickets: number;
};

export type EndpointMetric = {
  endpoint: string;
  method: string;
  requests: number;
  avg_latency_ms: number;
  errors: number;
  error_rate: number;
};

export type EndpointAnalytics = {
  by_volume: EndpointMetric[];
  by_latency: EndpointMetric[];
  by_error_rate: EndpointMetric[];
};

export type OrganizationAnalytics = {
  by_usage: { organization_id: string; name: string; usage: string; generation_volume: number }[];
  by_active_users: { organization_id: string; name: string; active_users: number }[];
  by_generation_volume: { organization_id: string; name: string; usage: string; generation_volume: number }[];
};

export type UsageTrend = {
  bucket: string;
  credits: string;
  cost_usd: string;
  generations: number;
};

export type AdminTrendOption = {
  value: string;
  label: string;
  provider?: string;
  model_name?: string;
};

export type AdminTrendPoint = {
  bucket: string;
  usage: number | string;
  cost_usd: string;
};

export type AdminTrendResponse = {
  selected_value: string;
  selected_label: string;
  options: AdminTrendOption[];
  points: AdminTrendPoint[];
  totals: {
    usage: number | string;
    cost_usd: string;
  };
};

export type ModelPricing = {
  id: string;
  provider: string;
  model_name: string;
  model_id: string;
  version: number;
  status: string;
  input_price_per_million: string;
  output_price_per_million: string;
  cache_read_price_per_million: string;
  cache_write_price_per_million: string;
  context_window_tokens: number | null;
  metadata_json: Record<string, unknown>;
  effective_from: string;
  effective_to: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type ComputePricing = {
  id: string;
  profile_key: string;
  display_name: string;
  runtime_image: string | null;
  version: number;
  status: string;
  vcpu_price_per_second: string;
  memory_gb_price_per_second: string;
  metadata_json: Record<string, unknown>;
  effective_from: string;
  effective_to: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type RuntimeProvider = {
  provider: string;
  supported: boolean;
};

export type OrganizationComputeOverride = {
  id: string;
  organization_id: string;
  compute_profile_key: string;
  status: string;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  deprecated_at: string | null;
};

export type ReportSummaryItem = {
  label: string;
  value: string;
};

export type ReportSectionRow = {
  label: string;
  values: string[];
};

export type ReportSection = {
  title: string;
  description: string;
  columns: string[];
  rows: ReportSectionRow[];
  empty_message: string;
};

export type ReportResult = {
  kind: string;
  title: string;
  description: string;
  summary: ReportSummaryItem[];
  sections: ReportSection[];
  export_ready: boolean;
};

export type SupportTicket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  tenant_type: string | null;
  tenant_id: string | null;
  assigned_user_id: string | null;
  created_at: string;
  updated_at: string;
  messages?: { id: string; body: string; visibility: string; sender_user_id: string | null; created_at: string }[];
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  status: string;
  audience_type: string;
  audience_json: Record<string, unknown>;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AnnouncementPayload = Omit<Announcement, "id" | "created_at" | "updated_at"> & {
  confirmation?: string;
};
