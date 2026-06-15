import { API_BASE_URL, apiRequest, csrfToken } from "@/src/shared/api-client";
import type {
  AgentAttachment,
  AgentIteration,
  FigmaConnection,
  FigmaImportRevision,
  ProjectAgentHistory,
  PreviewUrl,
  RuntimeModel,
  SandboxAction,
  SandboxSession,
  WorkspaceFileContent,
  WorkspaceFiles,
} from "./types";

export function notificationStreamUrl() {
  return `${API_BASE_URL}/notifications/stream`;
}

export function runtimeStreamUrl(projectId: string) {
  return `${API_BASE_URL}/runtime/stream?project_id=${encodeURIComponent(projectId)}`;
}

export function sandboxStatus(projectId: string) {
  return apiRequest<SandboxSession>(`/projects/${projectId}/sandbox`);
}

export function runtimeModels() {
  return apiRequest<RuntimeModel[]>("/runtime/models");
}

export function resumeSandbox(projectId: string) {
  return apiRequest<SandboxAction>(`/projects/${projectId}/sandbox/resume`, { method: "POST" });
}

export function hibernateSandbox(projectId: string) {
  return apiRequest<SandboxAction>(`/projects/${projectId}/sandbox/hibernate`, { method: "POST" });
}

export function previewUrl(projectId: string) {
  return apiRequest<PreviewUrl>(`/projects/${projectId}/preview-url`);
}

export function startAgentIteration(projectId: string, payload: { prompt: string; model_pricing_id: string; figma_import_revision_id?: string | null; attachment_paths?: string[]; completion_email_requested?: boolean }) {
  return apiRequest<AgentIteration, typeof payload>(`/projects/${projectId}/agent/iterations`, { method: "POST", body: payload });
}

export function projectAgentHistory(projectId: string) {
  return apiRequest<ProjectAgentHistory>(`/projects/${projectId}/agent/history`);
}

export function figmaConnections() {
  return apiRequest<FigmaConnection[]>("/connectors/figma");
}

export function startFigmaOAuth(returnPath?: string) {
  const query = returnPath ? `?return_path=${encodeURIComponent(returnPath)}` : "";
  return apiRequest<{ auth_url: string }>(`/connectors/figma/start${query}`);
}

export function createFigmaImport(
  projectId: string,
  payload: { figma_url: string; connector_account_id: string; selected_node_ids?: string[] | null },
) {
  return apiRequest<FigmaImportRevision, typeof payload>(`/projects/${projectId}/figma/imports`, { method: "POST", body: payload });
}

export function retryFigmaImport(projectId: string, revisionId: string) {
  return apiRequest<FigmaImportRevision>(`/projects/${projectId}/figma/imports/${revisionId}/retry`, { method: "POST" });
}

export function workspaceFiles(projectId: string) {
  return apiRequest<WorkspaceFiles>(`/projects/${projectId}/sandbox/files`);
}

export function workspaceFileContent(projectId: string, path: string) {
  return apiRequest<WorkspaceFileContent>(`/projects/${projectId}/sandbox/files/content?path=${encodeURIComponent(path)}`);
}


export async function uploadAgentAttachment(projectId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const csrf = csrfToken();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/agent/attachments`, {
    method: "POST",
    credentials: "include",
    headers: csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : undefined,
    body: form,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Attachment upload failed");
  return data as AgentAttachment;
}

export function cancelAgentIteration(projectId: string, runRecordId?: string | null) {
  const path = runRecordId
    ? `/projects/${projectId}/agent/iterations/${runRecordId}/cancel`
    : `/projects/${projectId}/agent/iterations/cancel`;
  return apiRequest<SandboxAction>(path, { method: "POST" });
}
