"use client";

export const RUNTIME_STATUS_EVENTS = new Set([
  "run_started",
  "run_failed",
  "run_completed",
  "model_selected",
  "tool_call_started",
  "tool_call_finished",
  "tool_call_failed",
  "plan_generated",
  "verification_started",
  "verification_finished",
  "agent.context_compaction.started",
  "agent.context_compaction.completed",
  "agent.context_compaction.failed",
  "agent.context_compaction.retrying",
  "preview_warm_started",
  "preview_warm_completed",
  "preview_warm_failed",
  "agent.continuation.started",
]);

const RUNTIME_REFRESH_EVENTS = new Set([
  "run_started",
  "run_failed",
  "run_completed",
  "agent.iteration.failed",
  "agent.iteration.cancelled",
  "agent.iteration.completed",
  "preview_warm_completed",
  "preview_warm_failed",
  "start_sandbox_task_activity_completed",
  "start_sandbox_task_activity_failed",
  "sandbox_ready",
  "workspace_scaffold_finished",
]);

export type RuntimeNotification = {
  title?: string;
  body?: string;
  event?: string;
  event_type?: string;
  template_key?: string;
  project_id?: string;
  response_text?: string;
  delta_text?: string;
  error?: string;
  message?: string;
  step?: string;
  status?: string;
  data?: Record<string, unknown>;
  run_record_id?: string;
  sequence?: number;
  tool_call_id?: string;
  tool?: string;
  payload?: RuntimeNotification;
};

type RuntimeEnvelope = {
  event_type?: string;
  project_id?: string;
  payload?: RuntimeNotification;
};

export function runtimeEventKey(eventType: string | undefined, payload: RuntimeNotification): string {
  const sequence = typeof payload.sequence === "number" ? String(payload.sequence) : "";
  const runId = payload.run_record_id ?? "";
  const toolId = payload.tool_call_id ?? payload.tool ?? "";
  const message = payload.message ?? payload.body ?? payload.step ?? "";
  return [runId, eventType ?? "", sequence, toolId, message].join("|");
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return null;
}

export function eventToStatus(_eventType: string | undefined, payload: RuntimeNotification) {
  return firstText(
    payload.message,
    payload.body,
    payload.payload?.message,
    payload.payload?.body,
    payload.error,
    payload.payload?.error,
  );
}

export function parseRuntimeEvent(raw: string) {
  const parsed = JSON.parse(raw) as RuntimeEnvelope | RuntimeNotification;
  if ("payload" in parsed && parsed.payload && typeof parsed.payload === "object") {
    return {
      eventType: parsed.event_type ?? parsed.payload.event_type ?? parsed.payload.event ?? parsed.payload.template_key,
      payloadProjectId: parsed.project_id ?? parsed.payload.project_id ?? parsed.payload.payload?.project_id,
      payload: parsed.payload,
    };
  }

  const payload = parsed as RuntimeNotification;
  return {
    eventType: payload.event_type ?? payload.event ?? payload.template_key,
    payloadProjectId: payload.project_id ?? payload.payload?.project_id,
    payload,
  };
}

export function shouldRefreshRuntime(eventType: string | undefined) {
  return RUNTIME_REFRESH_EVENTS.has(eventType ?? "") || Boolean(eventType?.startsWith("sandbox.figma_"));
}

export function partialImportRevision(payload: RuntimeNotification) {
  return typeof payload.data?.figma_import_revision_id === "string" ? payload.data.figma_import_revision_id : null;
}
