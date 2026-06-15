"use client";

import { ArrowDown, Rocket } from "lucide-react";
import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import type { RuntimeModel } from "@/src/features/runtime/types";
import { Message, StatusGroup } from "@/src/components/project/project-agent-message";
import type { ChatMessage } from "@/src/components/project/project-agent-events";
import { ProjectChatComposer } from "@/src/components/project/project-chat-composer";
import type { ProjectChatAttachment } from "@/src/components/project/project-chat-types";

const SCROLL_BOTTOM_THRESHOLD_PX = 120;
const THREAD_SUGGESTIONS = [
  "Refine the current Wyrefy UI and preserve state transitions.",
  "Use the attached Figma design as context for the next iteration.",
  "Debug the preview or runtime issue and explain the root cause.",
];

function isTerminalStatus(content: string): boolean {
  const normalized = content.toLowerCase();
  return (
    normalized === "preview warmed" ||
    normalized === "preview warm failed" ||
    normalized === "run completed" ||
    normalized === "verification complete" ||
    normalized.includes("cancelled") ||
    normalized.startsWith("failed:") ||
    normalized.includes("failed")
  );
}

type RenderableTimelineItem =
  | { type: "message"; role: "agent" | "user"; content: string; pending?: boolean; attachments?: ProjectChatAttachment[] }
  | { type: "status-group"; summary?: string; steps: string[]; isActive: boolean };

type ProjectChatThreadProps = Readonly<{
  hasStartedChat: boolean;
  messages: ChatMessage[];
  effectiveSelectedModelId: string;
  isSending: boolean;
  isCancelling?: boolean;
  models: RuntimeModel[];
  showModelPicker: boolean;
  input: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (modelId: string) => void;
  onSend: () => void;
  onValueChange: (value: string) => void;
  onCancel?: () => void;
  onFilesSelected?: (files: File[]) => void;
  onRemoveAttachment?: (path: string) => void;
  hasFigmaConnection?: boolean;
  onConnectFigma?: () => void;
  onFigmaMode?: () => void;
  attachments?: ProjectChatAttachment[];
  scrollRef: RefObject<HTMLDivElement | null>;
}>;

export function ProjectChatThread({
  hasStartedChat,
  messages,
  effectiveSelectedModelId,
  isSending,
  isCancelling = false,
  models,
  showModelPicker,
  input,
  onOpenChange,
  onSelect,
  onSend,
  onValueChange,
  onCancel,
  onFilesSelected,
  onRemoveAttachment,
  hasFigmaConnection = false,
  onConnectFigma,
  onFigmaMode,
  attachments = [],
  scrollRef,
}: ProjectChatThreadProps) {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const shouldDockComposer = hasStartedChat || isSending || isCancelling;

  const renderableMessages = useMemo(() => {
    const result: RenderableTimelineItem[] = [];
    let currentSteps: string[] = [];
    let isActiveGroup = false;

    for (const message of messages) {
      if (message.role === "status") {
        const incomingSteps = message.statusSteps?.length 
          ? message.statusSteps 
          : [message.content];
        
        currentSteps.push(...incomingSteps);
        
        if (message.pending) {
          isActiveGroup = true;
        }
        continue;
      }

      if (currentSteps.length > 0) {
        const lastStatus = currentSteps.at(-1) ?? "";
        result.push({
          type: "status-group",
          summary: lastStatus,
          steps: [...currentSteps],
          isActive: isActiveGroup || ((messages.some((m) => m.pending === true) || isSending) && !isTerminalStatus(lastStatus)),
        });
        currentSteps = [];
        isActiveGroup = false;
      }

      result.push({
        type: "message",
        role: message.role,
        content: message.content,
        pending: message.pending,
        attachments: message.attachments,
      });
    }

    if (currentSteps.length > 0) {
      const lastStatus = currentSteps.at(-1) ?? "";
      result.push({
        type: "status-group",
        summary: lastStatus,
        steps: currentSteps,
        isActive: isActiveGroup || ((messages.some((m) => m.pending === true) || isSending) && !isTerminalStatus(lastStatus)),
      });
    }

    return result;
  }, [isSending, messages]);

  const updateScrollAffordance = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      setShowScrollToBottom(false);
      return;
    }
    const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
    setShowScrollToBottom(remaining > SCROLL_BOTTOM_THRESHOLD_PX);
  }, [scrollRef]);

  const handleScrollToBottom = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    setShowScrollToBottom(false);
  }, [scrollRef]);

  useEffect(() => {
    updateScrollAffordance();
  }, [renderableMessages, updateScrollAffordance]);

  const composer = (
    <ProjectChatComposer
      active={hasStartedChat}
      disabled={!effectiveSelectedModelId}
      isSending={isSending}
      isCancelling={isCancelling}
      models={models}
      open={showModelPicker}
      placeholder={effectiveSelectedModelId ? "Describe the next iteration or paste a Figma link..." : "Configure an active runtime model first..."}
      selectedModelId={effectiveSelectedModelId}
      value={input}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      onSend={onSend}
      onValueChange={onValueChange}
      onCancel={onCancel}
      onFilesSelected={onFilesSelected}
      onRemoveAttachment={onRemoveAttachment}
      hasFigmaConnection={hasFigmaConnection}
      onConnectFigma={onConnectFigma}
      onFigmaMode={onFigmaMode}
      attachments={attachments}
    />
  );

  if (!shouldDockComposer) {
    return (
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.12),transparent_34%)]" />
        <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto w-full px-4">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-500/20 to-transparent p-px shadow-[0_0_40px_rgba(37,99,235,0.15)] ring-1 ring-white/10 dark:ring-white/5">
            <div className="flex size-full items-center justify-center rounded-2xl bg-slate-950/50 backdrop-blur-xl">
              <Rocket size={20} className="text-blue-400" />
            </div>
          </div>
          <h2 className="mx-auto mb-3 max-w-lg text-balance text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Build the next <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Wyrefy</span> iteration without losing the thread.
          </h2>
          <p className="mb-6 text-sm font-medium leading-relaxed text-[var(--muted)] sm:text-base">
            Start from a focused prompt, attach working files, or bring in a Figma design before the agent touches the workspace.
          </p>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3">
            {THREAD_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onValueChange(suggestion)}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-300 active:translate-y-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="mt-10 w-full">{composer}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden h-full w-full">
      <div className="relative min-h-0 flex-1 overflow-hidden h-full w-full">
        <div ref={scrollRef} onScroll={updateScrollAffordance} data-lenis-prevent="true" className="custom-scrollbar h-full min-h-0 overflow-y-auto px-4 pb-6 pt-5 sm:px-6">
          <div className={`mx-auto flex min-h-full max-w-5xl flex-col ${hasStartedChat ? "gap-4 pb-6" : "justify-center pb-4"}`}>
            {hasStartedChat ? (
              renderableMessages.map((item, index) => {
                const stableKey = `${item.type}-${index}`;
                return item.type === "message" ? (
                  <Message
                    key={stableKey}
                    role={item.role}
                    content={item.content}
                    pending={item.pending}
                    attachments={item.attachments}
                  />
                ) : (
                  <StatusGroup key={stableKey} summary={item.summary} steps={item.steps} isActive={item.isActive} />
                );
              })
            ) : (
              <div className="mx-auto w-full max-w-2xl text-center">
                <p className="text-sm font-semibold text-slate-200">Draft ready</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]/80">
                  Send the first request to anchor the conversation. The composer is now docked and the thread above will handle all scrolling.
                </p>
              </div>
            )}
          </div>
        </div>
        {showScrollToBottom && hasStartedChat ? (
          <button
            type="button"
            onClick={handleScrollToBottom}
            className="absolute bottom-6 right-6 flex size-12 items-center justify-center rounded-full border border-blue-400/20 bg-slate-950/85 text-blue-300 shadow-[0_18px_35px_rgba(15,23,42,0.45)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"
            aria-label="Scroll to latest message"
            title="Scroll to latest message"
          >
            <ArrowDown size={18} />
          </button>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-[var(--border)]/60 bg-[linear-gradient(to_top,rgba(2,6,23,0.92),rgba(2,6,23,0.78),transparent)] px-4 pb-5 pt-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto max-w-5xl">{composer}</div>
      </div>
    </div>
  );
}
