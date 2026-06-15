export type SandboxSession = {
  id: string;
  project_id: string;
  state: string;
  ecs_task_arn: string | null;
  sandbox_private_ip: string | null;
  grpc_port: number | null;
  preview_port: number | null;
  preview_metadata_json: Record<string, unknown>;
  snapshot_s3_key: string | null;
  snapshot_metadata_json: Record<string, unknown>;
  resume_context_json: Record<string, unknown>;
  last_heartbeat_at: string | null;
  warm_idle_deadline_at: string | null;
  started_at: string | null;
  last_metered_at: string | null;
  hibernated_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type SandboxAction = {
  session: SandboxSession;
  workflow_action: string;
  message: string;
  workflow_id: string | null;
};

export type PreviewUrl = {
  available: boolean;
  preview_url: string | null;
  expires_at: string | null;
  state: string;
  message: string;
  route_class: string | null;
  gateway_url: string | null;
  diagnostics: Record<string, unknown> | null;
};

export type WorkspaceFileEntry = {
  path: string;
  name: string;
  kind: "file" | "directory";
  depth: number;
  size_bytes: number | null;
};

export type WorkspaceFiles = {
  available: boolean;
  workspace_root: string;
  state: string;
  message: string;
  entries: WorkspaceFileEntry[];
  change_version: string | null;
  event_strategy: string;
  watch_url: string | null;
  refreshed_at: string;
};

export type WorkspaceFileContent = {
  available: boolean;
  workspace_root: string;
  state: string;
  message: string;
  path: string | null;
  content: string;
  line_limit: number;
  truncated: boolean;
  size_bytes: number | null;
  byte_limit: number | null;
  refreshed_at: string;
};

export type FigmaConnection = {
  id: string;
  figma_user_id: string;
  figma_email: string | null;
  figma_handle: string | null;
  status: string;
  scopes_json: unknown[];
  token_expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FigmaImportRevision = {
  id: string;
  project_id: string;
  connector_account_id: string;
  requested_by_user_id: string;
  revision_number: number;
  figma_file_key: string;
  figma_url: string;
  selected_node_ids: string[] | null;
  status: string;
  is_current: boolean;
  workspace_path: string;
  import_summary_json: Record<string, unknown>;
  manifest_json: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type AgentAttachment = {
  path: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number;
  kind: string;
  message: string;
};

export type AgentIteration = {
  sandbox_session_id: string;
  workflow_id: string;
  message: string;
};

export type ProjectAgentRun = {
  run_record_id: string;
  project_id: string;
  sandbox_session_id: string;
  thread_id: string;
  actor_user_id: string | null;
  model_pricing_id: string | null;
  figma_import_revision_id: string | null;
  state: string;
  user_prompt: string;
  assistant_response: string;
  prompt_summary_json: Record<string, unknown>;
  checkpoint_json: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
};

export type ProjectAgentHistory = {
  project_id: string;
  runs: ProjectAgentRun[];
};

export type RuntimeModel = {
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
};
