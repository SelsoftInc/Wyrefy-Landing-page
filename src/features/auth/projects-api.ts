"use client";

import { apiRequest } from "@/src/shared/api-client";
import type { Project, ProjectArtifact, ProjectDownload, ProjectLimits, ProjectUsage, MessageResponse } from "./types";

export function projects() {
  return apiRequest<Project[]>("/projects");
}

export function projectLimits() {
  return apiRequest<ProjectLimits>("/projects/limits");
}

export function projectDetail(id: string) {
  return apiRequest<Project>(`/projects/${id}`);
}

export function createProject(payload: { name: string; description?: string; visibility?: string; stack_target?: Record<string, unknown> }) {
  return apiRequest<Project, typeof payload>("/projects", { method: "POST", body: payload });
}

export function updateProject(id: string, payload: { name?: string; description?: string | null; visibility?: string; stack_target?: Record<string, unknown> }) {
  return apiRequest<Project, typeof payload>(`/projects/${id}`, { method: "PATCH", body: payload });
}

export function projectArtifacts(id: string) {
  return apiRequest<ProjectArtifact[]>(`/projects/${id}/artifacts`);
}

export function projectDownload(id: string) {
  return apiRequest<ProjectDownload>(`/projects/${id}/download`);
}

export function projectUsage(id: string) {
  return apiRequest<ProjectUsage>(`/projects/${id}/usage`);
}

export function deleteProject(id: string, payload: { confirmation: string }) {
  return apiRequest<MessageResponse, typeof payload>(`/projects/${id}`, { method: "DELETE", body: payload });
}
