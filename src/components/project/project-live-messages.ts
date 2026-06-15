"use client";

import type { ProjectChatAttachment } from "@/src/components/project/project-chat-types";

export type LiveChatMessage = {
  role: "agent" | "user" | "status";
  content: string;
  pending?: boolean;
  attachments?: ProjectChatAttachment[];
  reconcileAfterRunCount?: number;
  runRecordId?: string;
  statusSteps?: string[];
};

function pendingAgentIndex(messages: LiveChatMessage[], runRecordId?: string): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "agent" || message.pending !== true) continue;
    if (!runRecordId) return index;
    if (message.runRecordId === runRecordId || typeof message.runRecordId === "undefined") return index;
  }
  return -1;
}

export function startAssistantStream(messages: LiveChatMessage[], runRecordId?: string): LiveChatMessage[] {
  const index = pendingAgentIndex(messages, runRecordId);
  if (index >= 0) {
    if (!runRecordId || messages[index]?.runRecordId === runRecordId) return messages;
    const next = [...messages];
    next[index] = { ...next[index], runRecordId };
    return next;
  }

  return [...messages, { role: "agent", content: "", pending: true, runRecordId } satisfies LiveChatMessage];
}

export function appendAssistantStreamDelta(messages: LiveChatMessage[], runRecordId: string | undefined, deltaText: string): LiveChatMessage[] {
  const next = startAssistantStream([...messages], runRecordId);
  const index = pendingAgentIndex(next, runRecordId);
  if (index < 0) return next;
  next[index] = {
    ...next[index],
    runRecordId: runRecordId ?? next[index]?.runRecordId,
    content: `${next[index]?.content ?? ""}${deltaText}`,
  };
  return next;
}

export function completeAssistantStream(messages: LiveChatMessage[], runRecordId: string | undefined, responseText?: string): LiveChatMessage[] {
  const index = pendingAgentIndex(messages, runRecordId);
  if (index < 0) {
    return responseText?.trim() ? [...messages, { role: "agent", content: responseText.trim(), runRecordId }] : messages;
  }

  const next = [...messages];
  const content = responseText?.trim() || next[index]?.content || "";
  next[index] = {
    ...next[index],
    role: "agent",
    content,
    pending: false,
    runRecordId: runRecordId ?? next[index]?.runRecordId,
  };
  return next;
}
