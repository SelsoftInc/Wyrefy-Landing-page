"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { notificationStreamUrl, runtimeStreamUrl } from "@/src/features/runtime/api";
import type { ProjectAgentRun } from "@/src/features/runtime/types";
import {
  eventToStatus,
  parseRuntimeEvent,
  partialImportRevision,
  type RuntimeNotification,
  RUNTIME_STATUS_EVENTS,
  runtimeEventKey,
  shouldRefreshRuntime,
} from "@/src/components/project/project-agent-event-utils";
import type { ProjectChatAttachment } from "@/src/components/project/project-chat-types";

export type ChatMessage = {
  role: "agent" | "user" | "status";
  content: string;
  pending?: boolean;
  attachments?: ProjectChatAttachment[];
  reconcileAfterRunCount?: number;
  runRecordId?: string;
  statusSteps?: string[];
};

function compactStatusMessages(messages: ChatMessage[]): ChatMessage[] {
  const output: ChatMessage[] = [];

  for (const message of messages) {
    if (message.role !== "status") {
      output.push(message);
      continue;
    }

    const incomingSteps = message.statusSteps?.length ? message.statusSteps : [message.content];
    const previous = output.at(-1);
    if (previous?.role !== "status" || previous.runRecordId !== message.runRecordId) {
      output.push({ ...message, statusSteps: incomingSteps });
      continue;
    }

    const previousSteps = previous.statusSteps ?? [previous.content];
    output[output.length - 1] = {
      ...previous,
      content: previous.content || message.content,
      statusSteps: [...previousSteps.filter((step) => step.trim().length > 0), ...incomingSteps],
      runRecordId: previous.runRecordId ?? message.runRecordId,
    };
  }
  return output;
}

export function mergeChatMessages(historyMessages: ChatMessage[], liveMessages: ChatMessage[], historyRunCount: number): ChatMessage[] {
  const historyUserText = new Set(historyMessages.filter((item) => item.role === "user").map((item) => item.content));
  const historyAgentText = new Set(historyMessages.filter((item) => item.role === "agent").map((item) => item.content));
  const historyUserRunIds = new Set(historyMessages.filter((item) => item.role === "user" && item.runRecordId).map((item) => item.runRecordId as string));
  const historyAgentRunIds = new Set(historyMessages.filter((item) => item.role === "agent" && item.runRecordId).map((item) => item.runRecordId as string));

  const filteredLive = liveMessages.filter((item) => {
    const shouldReconcile = typeof item.reconcileAfterRunCount === "number" && historyRunCount >= item.reconcileAfterRunCount;
    if (!shouldReconcile) return true;

    if (item.runRecordId) {
      if (item.role === "user" && historyUserRunIds.has(item.runRecordId)) return false;
      if (item.role === "agent" && historyAgentRunIds.has(item.runRecordId)) return false;
    }

    if (item.role === "user" && historyUserText.has(item.content)) return false;
    if (item.role === "agent" && item.pending !== true && historyAgentText.has(item.content)) return false;
    return true;
  });

  return compactStatusMessages([...historyMessages, ...filteredLive]);
}

export function historyToMessages(runs: ProjectAgentRun[]): ChatMessage[] {
  const messages: ChatMessage[] = [];

  for (const run of runs) {
    if (run.user_prompt.trim()) {
      messages.push({ role: "user", content: run.user_prompt.trim(), runRecordId: run.run_record_id });
    }

    if (run.assistant_response.trim()) {
      messages.push({ role: "agent", content: run.assistant_response.trim(), runRecordId: run.run_record_id });
    }
  }

  return messages;
}

type NotificationHandlers = Readonly<{
  eventType: string | undefined;
  payload: RuntimeNotification;
  belongsToProject: boolean;
  seenRuntimeEvents: Set<string>;
  appendMessage: (message: ChatMessage) => void;
  refreshRuntime: () => void;
  refreshCredits?: () => void;
  onFigmaPartialImport?: (revisionId: string | null) => void;
  onIterationTerminal?: () => void;
  onAssistantStreamStart?: (runRecordId?: string) => void;
  onAssistantStreamDelta?: (runRecordId: string | undefined, deltaText: string) => void;
  onAssistantStreamComplete?: (runRecordId: string | undefined, responseText?: string) => void;
  showToast: (message: string, variant?: "success" | "error" | "info") => void;
}>;

function payloadRunRecordId(payload: RuntimeNotification): string | undefined {
  return typeof payload.run_record_id === "string"
    ? payload.run_record_id
    : typeof payload.payload?.run_record_id === "string"
      ? payload.payload.run_record_id
      : undefined;
}

function handleRuntimeStatusEvent({ eventType, payload, belongsToProject, seenRuntimeEvents, appendMessage, refreshRuntime, onFigmaPartialImport }: NotificationHandlers) {
  if (!belongsToProject || !(RUNTIME_STATUS_EVENTS.has(eventType ?? "") || eventType?.startsWith("sandbox."))) return false;

  const dedupeKey = runtimeEventKey(eventType, payload);
  if (seenRuntimeEvents.has(dedupeKey)) return true;

  seenRuntimeEvents.add(dedupeKey);
  const statusText = eventToStatus(eventType, payload);
  if (statusText) appendMessage({ role: "status", content: statusText, runRecordId: payloadRunRecordId(payload) });
  if (eventType === "sandbox.figma_import_ready_partial_assets") onFigmaPartialImport?.(partialImportRevision(payload));
  if (shouldRefreshRuntime(eventType)) refreshRuntime();
  return true;
}

function handleAssistantStreamEvent({ eventType, payload, belongsToProject, onAssistantStreamStart, onAssistantStreamDelta, onAssistantStreamComplete }: NotificationHandlers) {
  if (!belongsToProject) return false;
  const runRecordId = payloadRunRecordId(payload);
  if (eventType === "assistant.message.started") {
    onAssistantStreamStart?.(runRecordId);
    return true;
  }
  if (eventType === "assistant.message.delta") {
    const deltaText = payload.delta_text ?? payload.payload?.delta_text ?? "";
    if (deltaText) onAssistantStreamDelta?.(runRecordId, deltaText);
    return true;
  }
  if (eventType === "assistant.message.completed") {
    onAssistantStreamComplete?.(runRecordId, payload.response_text ?? payload.payload?.response_text);
    return true;
  }
  return false;
}

function handleIterationEvent({ eventType, payload, belongsToProject, appendMessage, refreshRuntime, onIterationTerminal }: NotificationHandlers) {
  if (!belongsToProject) return false;
  const runRecordId = payloadRunRecordId(payload);
  if (eventType === "agent.iteration.completed") {
    const responseText = payload.response_text ?? payload.payload?.response_text ?? "";
    const streamedResponse = payload.data?.streamed_response === true || payload.payload?.data?.streamed_response === true;
    if (responseText.trim() && !streamedResponse) appendMessage({ role: "agent", content: responseText, runRecordId });
    onIterationTerminal?.();
    refreshRuntime();
    return true;
  }
  if (eventType === "agent.iteration.cancelled") {
    const statusText = eventToStatus(eventType, payload);
    if (statusText) appendMessage({ role: "status", content: statusText, runRecordId });
    onIterationTerminal?.();
    refreshRuntime();
    return true;
  }
  if (eventType === "agent.iteration.failed") {
    const statusText = eventToStatus(eventType, payload);
    if (statusText) appendMessage({ role: "status", content: statusText, runRecordId });
    onIterationTerminal?.();
    refreshRuntime();
    return true;
  }
  return false;
}

function handleGeneralNotification({ eventType, payload, refreshCredits, showToast }: NotificationHandlers) {
  if (eventType === "credits.updated") {
    refreshCredits?.();
    return;
  }
  if (payload.body || payload.title) showToast(payload.body || payload.title || "Runtime update", "info");
}

type ProjectAgentNotificationsInput = {
  projectId: string;
  showToast: (message: string, variant?: "success" | "error" | "info") => void;
  appendMessage: (message: ChatMessage) => void;
  refreshRuntime: () => void;
  refreshCredits?: () => void;
  onFigmaPartialImport?: (revisionId: string | null) => void;
  onIterationTerminal?: () => void;
  onAssistantStreamStart?: (runRecordId?: string) => void;
  onAssistantStreamDelta?: (runRecordId: string | undefined, deltaText: string) => void;
  onAssistantStreamComplete?: (runRecordId: string | undefined, responseText?: string) => void;
};

export function useProjectAgentNotifications({
  projectId,
  showToast,
  appendMessage,
  refreshRuntime,
  refreshCredits,
  onFigmaPartialImport,
  onIterationTerminal,
  onAssistantStreamStart,
  onAssistantStreamDelta,
  onAssistantStreamComplete,
}: ProjectAgentNotificationsInput) {
  const seenRuntimeEvents = useRef<Set<string>>(new Set());

  const onRuntimeEvent = useEffectEvent((event: MessageEvent<string>) => {
    try {
      const { eventType, payloadProjectId, payload } = parseRuntimeEvent(event.data);
      const context: NotificationHandlers = {
        eventType,
        payload,
        belongsToProject: payloadProjectId === projectId,
        seenRuntimeEvents: seenRuntimeEvents.current,
        appendMessage,
        refreshRuntime,
        refreshCredits,
        onFigmaPartialImport,
        onIterationTerminal,
        onAssistantStreamStart,
        onAssistantStreamDelta,
        onAssistantStreamComplete,
        showToast,
      };

      if (handleRuntimeStatusEvent(context)) return;
      if (handleAssistantStreamEvent(context)) return;
      handleIterationEvent(context);
    } catch {
      // Ignore malformed runtime stream events.
    }
  });

  const onNotificationEvent = useEffectEvent((event: MessageEvent<string>) => {
    try {
      const payload = JSON.parse(event.data) as RuntimeNotification;
      const eventType = payload.event_type ?? payload.event ?? payload.template_key;
      handleGeneralNotification({
        eventType,
        payload,
        belongsToProject: true,
        seenRuntimeEvents: seenRuntimeEvents.current,
        appendMessage,
        refreshRuntime,
        refreshCredits,
        onFigmaPartialImport,
        onIterationTerminal,
        onAssistantStreamStart,
        onAssistantStreamDelta,
        onAssistantStreamComplete,
        showToast,
      });
    } catch {
      // Ignore malformed notification events.
    }
  });

  useEffect(() => {
    const stream = new EventSource(runtimeStreamUrl(projectId), { withCredentials: true });
    const handleRuntime = (event: MessageEvent<string>) => onRuntimeEvent(event);
    stream.addEventListener("runtime", handleRuntime);
    return () => {
      stream.removeEventListener("runtime", handleRuntime);
      stream.close();
    };
  }, [projectId]);

  useEffect(() => {
    const stream = new EventSource(notificationStreamUrl(), { withCredentials: true });
    const handleNotification = (event: MessageEvent<string>) => onNotificationEvent(event);
    stream.addEventListener("notification", handleNotification);
    return () => {
      stream.removeEventListener("notification", handleNotification);
      stream.close();
    };
  }, []);
}
