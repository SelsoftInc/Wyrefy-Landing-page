"use client";

import type { RefObject } from "react";
import { SandboxWorkspaceBrowser } from "@/src/components/sandbox/sandbox-workspace-browser";
import type { ChatMessage } from "@/src/components/project/project-agent-events";
import { ProjectChatThread } from "@/src/components/project/project-chat-thread";
import { ProjectFigmaPartialBanner } from "@/src/components/project/project-figma-partial-banner";
import type { ProjectChatAttachment } from "@/src/components/project/project-chat-types";
import type { RuntimeModel } from "@/src/features/runtime/types";

type ProjectAgentMainPanelProps = Readonly<{
  activePanel: "chat" | "files";
  projectId: string;
  sandboxState: string;
  partialFigmaRevisionId: string | null;
  retryingPartialFigma: boolean;
  onContinuePartialFigma: () => void;
  onRetryPartialFigma: () => void;
  hasStartedChat: boolean;
  messages: ChatMessage[];
  effectiveSelectedModelId: string;
  isSending: boolean;
  isCancelling: boolean;
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
  hasFigmaConnection: boolean;
  onConnectFigma: () => void;
  onFigmaMode: () => void;
  attachments: ProjectChatAttachment[];
  scrollRef: RefObject<HTMLDivElement | null>;
}>;

export function ProjectAgentMainPanel({
  activePanel,
  projectId,
  sandboxState,
  partialFigmaRevisionId,
  retryingPartialFigma,
  onContinuePartialFigma,
  onRetryPartialFigma,
  hasStartedChat,
  messages,
  effectiveSelectedModelId,
  isSending,
  isCancelling,
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
  hasFigmaConnection,
  onConnectFigma,
  onFigmaMode,
  attachments,
  scrollRef,
}: ProjectAgentMainPanelProps) {
  if (activePanel === "files") {
    return (
      <div className="min-h-0 flex-1 p-4">
        <SandboxWorkspaceBrowser projectId={projectId} sandboxState={sandboxState} />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col h-full w-full">
      {partialFigmaRevisionId ? (
        <ProjectFigmaPartialBanner
          retrying={retryingPartialFigma}
          onContinue={onContinuePartialFigma}
          onRetry={onRetryPartialFigma}
        />
      ) : null}
      <ProjectChatThread
        hasStartedChat={hasStartedChat}
        messages={messages}
        effectiveSelectedModelId={effectiveSelectedModelId}
        isSending={isSending}
        isCancelling={isCancelling}
        models={models}
        showModelPicker={showModelPicker}
        input={input}
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
        scrollRef={scrollRef}
      />
    </div>
  );
}
