import type { ChatMessage } from "@/src/components/project/project-agent-events";

export function appendRuntimeMessage(messages: ChatMessage[], message: ChatMessage): ChatMessage[] {
  if (message.role === "status") return [...messages, message];

  const next = messages.filter((item) => {
    if (item.role !== "agent" || item.pending !== true) return true;
    if (!message.runRecordId) return false;
    return item.runRecordId !== message.runRecordId && typeof item.runRecordId !== "undefined";
  });

  if (message.role === "agent" && message.runRecordId) {
    const existingIndex = next.findIndex((item) => item.role === "agent" && item.runRecordId === message.runRecordId);
    if (existingIndex >= 0) {
      next[existingIndex] = { ...next[existingIndex], ...message };
      return next;
    }
  }

  return [...next, message];
}
