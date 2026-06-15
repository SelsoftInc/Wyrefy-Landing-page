export type AuthSession = {
  id: string;
  device_label: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  is_current: boolean;
  is_active: boolean;
};

export type ConnectedIdentity = {
  id: string;
  provider: string;
  email: string;
  created_at: string;
};

export type NotificationSettings = {
  product_updates: boolean;
  billing_alerts: boolean;
  security_alerts: boolean;
  generation_alerts: boolean;
};

export type MessageResponse = {
  message: string;
};

export type OrganizationSecurityDefaults = {
  require_google_sso: boolean;
  require_two_factor: boolean;
  session_timeout_minutes: number;
};

export type OrganizationMemberDefaults = {
  default_role: string;
  default_can_manage_billing: boolean;
};

export type OrganizationRetentionSettings = {
  project_retention_days: number;
  audit_retention_days: number;
};
