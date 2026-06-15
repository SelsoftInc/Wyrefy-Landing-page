"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projectDownload } from "@/src/features/auth/api";
import type { Project } from "@/src/features/auth/types";
import {
  cancelAgentIteration,
  createFigmaImport,
  figmaConnections,
  hibernateSandbox,
  projectAgentHistory,
  previewUrl,
  resumeSandbox,
  retryFigmaImport,
  runtimeModels,
  sandboxStatus,
  startAgentIteration,
  startFigmaOAuth,
  uploadAgentAttachment,
} from "@/src/features/runtime/api";
import type { ProjectAgentRun } from "@/src/features/runtime/types";
import { ProjectAgentHeader } from "@/src/components/project/project-agent-header";
import { historyToMessages, mergeChatMessages, type ChatMessage, useProjectAgentNotifications } from "@/src/components/project/project-agent-events";
import { ProjectAgentMainPanel } from "@/src/components/project/project-agent-main-panel";
import { extractFigmaUrl, invalidateCreditQueries } from "@/src/components/project/project-agent-utils";
import { appendAssistantStreamDelta, completeAssistantStream, startAssistantStream } from "@/src/components/project/project-live-messages";
import { appendRuntimeMessage } from "@/src/components/project/project-live-thread-state";
import { ProjectPreviewModal } from "@/src/components/project/project-preview-modal";
import type { ProjectChatAttachment } from "@/src/components/project/project-chat-types";
import { projectRuntimeErrorMessage, projectRuntimeFailureStatus } from "@/src/components/project/project-runtime-errors";
import { activeAgentRun, useProjectSelectedModel } from "@/src/components/project/use-project-selected-model";
import { useProjectRunState } from "@/src/components/project/use-project-run-state";
import { useToast } from "@/src/components/ui/toast";
import { useAuthStore } from "@/src/features/auth/store";
import { queryKeys } from "@/src/features/query-keys";

async function resolveFigmaRevisionId(projectId: string, prompt: string, figmaConnectionsData: { status?: string; id: string }[]) {
  const figmaUrl = extractFigmaUrl(prompt);
  if (!figmaUrl) return null;

  const connection = figmaConnectionsData.find((item) => item.status === "connected") ?? figmaConnectionsData[0];
  if (!connection) throw new Error("Connect Figma before importing a Figma link.");

  const revision = await createFigmaImport(projectId, {
    figma_url: figmaUrl,
    connector_account_id: connection.id,
  });
  return revision.id;
}

const EMPTY_RUNS: ProjectAgentRun[] = [];

type AgentViewProps = Readonly<{ project: Project; onBack: () => void }>;

export function AgentView({ project, onBack }: AgentViewProps) {
  const [input, setInput] = useState("");
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [activePanel, setActivePanel] = useState<"chat" | "files">("chat");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [attachments, setAttachments] = useState<ProjectChatAttachment[]>([]);
  const [completionEmailRequested, setCompletionEmailRequested] = useState(false);
  const [partialFigmaRevisionId, setPartialFigmaRevisionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const userId = useAuthStore((state) => state.user?.id);
  const ownerType = project.owner_type as "individual" | "organization";

  const statusQuery = useQuery({ queryKey: queryKeys.sandbox(project.id), queryFn: () => sandboxStatus(project.id) });
  const sandboxState = statusQuery.data?.state ?? "checking";
  const isLive = ["warm_ready", "warm_idle", "interactive", "agent_running", "background_running"].includes(sandboxState);
  const previewQuery = useQuery({ queryKey: queryKeys.previewUrl(project.id), queryFn: () => previewUrl(project.id), enabled: isLive, staleTime: 60_000, retry: false });
  const historyQuery = useQuery({ queryKey: queryKeys.projectAgentHistory(project.id), queryFn: () => projectAgentHistory(project.id) });
  const figmaQuery = useQuery({ queryKey: queryKeys.figmaConnections(userId ?? ""), queryFn: figmaConnections, enabled: Boolean(userId) });
  const modelsQuery = useQuery({ queryKey: queryKeys.runtimeModels(), queryFn: runtimeModels });

  const runs = historyQuery.data?.runs ?? EMPTY_RUNS;
  const historyMessages = useMemo(() => historyToMessages(runs), [runs]);
  const messages = useMemo(() => mergeChatMessages(historyMessages, liveMessages, runs.length), [historyMessages, liveMessages, runs.length]);
  const activeRun = useMemo(() => activeAgentRun(runs), [runs]);
  const { isBusy: isAgentBusy, isCancelling: isCancellingRun, beginStart, markRunAccepted, markRunFailed, beginCancel, markCancelFailed, markTerminal } = useProjectRunState({ activeRun, sandboxState, runs });
  const hasFigmaConnection = Boolean(figmaQuery.data?.some((item) => item.status === "connected"));
  const effectiveSelectedModelId = selectedModelId || activeRun?.model_pricing_id || modelsQuery.data?.[0]?.id || "";

  useEffect(() => {
    if (isAgentBusy) return;
    const timer = setTimeout(() => setLiveMessages((prev) => prev.filter((item) => item.pending !== true)), 0);
    return () => clearTimeout(timer);
  }, [isAgentBusy]);

  useProjectSelectedModel({ projectId: project.id, models: modelsQuery.data, runs, selectedModelId, setSelectedModelId });

  const refreshRuntime = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.sandbox(project.id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.previewUrl(project.id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projectAgentHistory(project.id) });
  }, [project.id, queryClient]);

  const refreshCredits = () => invalidateCreditQueries(queryClient, ownerType, project.owner_id, project.id);

  const resume = useMutation({
    mutationFn: () => resumeSandbox(project.id),
    onSuccess: (result) => { refreshRuntime(); showToast(result.message, "info"); },
    onError: (error) => showToast(projectRuntimeErrorMessage(error, "Unable to resume sandbox"), "error"),
  });

  const hibernate = useMutation({
    mutationFn: () => hibernateSandbox(project.id),
    onSuccess: (result) => { refreshRuntime(); showToast(result.message, "info"); },
    onError: (error) => showToast(projectRuntimeErrorMessage(error, "Unable to hibernate sandbox"), "error"),
  });

  const download = useMutation({
    mutationFn: () => projectDownload(project.id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectDownload(project.id) });
      if (result.download_url) globalThis.open(result.download_url, "_blank", "noopener,noreferrer");
      showToast(result.message, result.available ? "info" : "error");
    },
    onError: (error) => showToast(projectRuntimeErrorMessage(error, "Unable to prepare download"), "error"),
  });

  const uploadAttachment = useMutation({
    mutationFn: async (files: File[]) => {
      const uploaded = [];
      for (const file of files.slice(0, 10 - attachments.length)) uploaded.push(await uploadAgentAttachment(project.id, file));
      return uploaded;
    },
    onSuccess: (uploaded) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectAttachments(project.id) });
      setAttachments((prev) => [
        ...prev,
        ...uploaded.map((item) => ({ filename: item.filename, path: item.path, status: "attached", kind: item.kind, mimeType: item.mime_type, sizeBytes: item.size_bytes })),
      ]);
    },
    onError: (error) => showToast(projectRuntimeErrorMessage(error, "Attachment upload failed"), "error"),
  });

  const retryPartialFigma = useMutation({
    mutationFn: async () => {
      if (!partialFigmaRevisionId) throw new Error("No partial Figma import is available to retry.");
      return retryFigmaImport(project.id, partialFigmaRevisionId);
    },
    onSuccess: () => { setPartialFigmaRevisionId(null); refreshRuntime(); showToast("Retrying Figma asset download.", "info"); },
    onError: (error) => showToast(projectRuntimeErrorMessage(error, "Unable to retry Figma import"), "error"),
  });

  const cancelRun = useMutation({
    mutationFn: () => cancelAgentIteration(project.id, activeRun?.run_record_id),
    onMutate: () => beginCancel(),
    onSuccess: (result) => {
      setLiveMessages((prev) => prev.filter((item) => item.pending !== true));
      setAttachments((prev) => prev.filter((item) => item.status !== "processing"));
      refreshRuntime();
      if (result.message.trim()) showToast(result.message, "info");
    },
    onError: (error) => { markCancelFailed(); showToast(projectRuntimeErrorMessage(error, "Unable to cancel agent run"), "error"); },
  });

  const agent = useMutation({
    mutationFn: async ({ prompt, modelPricingId }: { prompt: string; modelPricingId: string }) => {
      const revisionId = await resolveFigmaRevisionId(project.id, prompt, figmaQuery.data ?? []);
      return startAgentIteration(project.id, { prompt, model_pricing_id: modelPricingId, figma_import_revision_id: revisionId, attachment_paths: attachments.map((item) => item.path), completion_email_requested: completionEmailRequested });
    },
    onSuccess: () => {
      const reconcileAfterRunCount = runs.length + 1;
      markRunAccepted();
      refreshRuntime();
      setAttachments((prev) => prev.map((item) => ({ ...item, status: "processing" })));
      setLiveMessages((prev) => [...prev.filter((item) => item.pending !== true), { role: "agent", content: "", pending: true, reconcileAfterRunCount }]);
    },
    onError: (error) => {
      markRunFailed();
      setAttachments((prev) => prev.map((item) => ({ ...item, status: "attached" })));
      setLiveMessages((prev) => [...prev.filter((item) => item.pending !== true), { role: "status", content: projectRuntimeErrorMessage(error, projectRuntimeFailureStatus("Agent iteration failed to start")) }]);
    },
  });

  const connectFigma = async () => {
    const returnPath = `${globalThis.location.pathname}${globalThis.location.search}`;
    const result = await startFigmaOAuth(returnPath);
    globalThis.location.href = result.auth_url;
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 120;
    if (isNearBottom || messages.at(-1)?.role === "user") element.scrollTop = element.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!["queued", "starting", "scaffolding", "resuming", "hibernating", "agent_running", "background_running"].includes(statusQuery.data?.state ?? "")) return;
    const timer = globalThis.setInterval(refreshRuntime, 2500);
    return () => globalThis.clearInterval(timer);
  }, [refreshRuntime, statusQuery.data?.state]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projectAgentHistory(project.id) });
  }, [project.id, queryClient, sandboxState]);

  useProjectAgentNotifications({
    projectId: project.id,
    showToast,
    appendMessage: (message) => {
      setLiveMessages((prev) => appendRuntimeMessage(prev, message));
      const normalized = message.content.toLowerCase();
      if (message.role === "agent" || normalized.includes("cancelled") || normalized.includes("failed")) {
        setAttachments((prev) => prev.filter((item) => item.status !== "processing"));
      }
    },
    onAssistantStreamStart: (runRecordId) => setLiveMessages((prev) => startAssistantStream(prev, runRecordId)),
    onAssistantStreamDelta: (runRecordId, deltaText) => setLiveMessages((prev) => appendAssistantStreamDelta(prev, runRecordId, deltaText)),
    onAssistantStreamComplete: (runRecordId, responseText) => {
      setLiveMessages((prev) => completeAssistantStream(prev, runRecordId, responseText));
      setAttachments((prev) => prev.filter((item) => item.status !== "processing"));
    },
    onIterationTerminal: markTerminal,
    refreshRuntime,
    refreshCredits,
    onFigmaPartialImport: setPartialFigmaRevisionId,
  });

  useEffect(() => {
    if (!showPreview) return;
    if (previewQuery.data?.available) {
      const expiresAt = previewQuery.data.expires_at;
      if (!expiresAt) return;
      const msUntilExpiry = new Date(expiresAt).getTime() - Date.now() - 10_000;
      if (msUntilExpiry <= 0) return;
      const timer = globalThis.setTimeout(() => queryClient.invalidateQueries({ queryKey: queryKeys.previewUrl(project.id) }), msUntilExpiry);
      return () => globalThis.clearTimeout(timer);
    }
    const timer = globalThis.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sandbox(project.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.previewUrl(project.id) });
    }, 5000);
    return () => globalThis.clearInterval(timer);
  }, [previewQuery.data?.available, previewQuery.data?.expires_at, project.id, queryClient, showPreview]);

  const handlePreview = async () => {
    if (!isLive) await resume.mutateAsync();
    if (!previewQuery.data?.available) return showToast("Preview will appear after verification completes.", "info");
    setShowPreview(true);
    await queryClient.invalidateQueries({ queryKey: queryKeys.previewUrl(project.id) });
  };

  const handleSend = async () => {
    const prompt = input.trim();
    if ((!prompt && attachments.length === 0) || isAgentBusy || uploadAttachment.isPending || !effectiveSelectedModelId) return;
    const attachmentLabel = attachments.length > 0 ? `Attached files: ${attachments.map((item) => item.filename).join(", ")}` : "";
    const reconcileAfterRunCount = runs.length + 1;
    const newMessages: ChatMessage[] = [{ role: "user", content: prompt || attachmentLabel, attachments: attachments.length > 0 ? attachments : undefined, reconcileAfterRunCount }];
    setLiveMessages((prev) => [...prev, ...newMessages]);
    setInput("");
    beginStart();
    try {
      await agent.mutateAsync({ prompt, modelPricingId: effectiveSelectedModelId });
    } catch {
      // Error state is handled in the mutation callbacks.
    }
  };

  const canSleep = ["warm_ready", "interactive", "warm_idle"].includes(sandboxState);
  const previewAvailable = Boolean(previewQuery.data?.available);

  return (
    <>
      <div className="flex flex-1 w-full h-full min-h-0 flex-col animate-in fade-in duration-500">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ProjectAgentHeader
            projectName={project.name}
            projectStatus={project.status}
            activePanel={activePanel}
            sandboxState={sandboxState}
            isLive={isLive}
            previewAvailable={previewAvailable}
            canSleep={canSleep}
            resumePending={resume.isPending}
            hibernatePending={hibernate.isPending}
            downloadPending={download.isPending}
            completionEmailRequested={completionEmailRequested}
            onBack={onBack}
            onPanelChange={setActivePanel}
            onPreview={() => void handlePreview()}
            onHibernate={() => hibernate.mutate()}
            onResume={() => resume.mutate()}
            onDownload={() => download.mutate()}
            onToggleCompletionEmailRequested={() => setCompletionEmailRequested((current) => !current)}
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <ProjectAgentMainPanel
              activePanel={activePanel}
              projectId={project.id}
              sandboxState={sandboxState}
              partialFigmaRevisionId={partialFigmaRevisionId}
              retryingPartialFigma={retryPartialFigma.isPending}
              onContinuePartialFigma={() => setPartialFigmaRevisionId(null)}
              onRetryPartialFigma={() => retryPartialFigma.mutate()}
              hasStartedChat={messages.length > 0}
              messages={messages}
              effectiveSelectedModelId={effectiveSelectedModelId}
              isSending={isAgentBusy}
              isCancelling={cancelRun.isPending || isCancellingRun}
              models={modelsQuery.data ?? []}
              showModelPicker={showModelPicker}
              input={input}
              onOpenChange={setShowModelPicker}
              onSelect={setSelectedModelId}
              onSend={() => void handleSend()}
              onValueChange={setInput}
              onCancel={isAgentBusy ? () => { if (!cancelRun.isPending) cancelRun.mutate(); } : undefined}
              onFilesSelected={(files) => uploadAttachment.mutate(files)}
              onRemoveAttachment={(path) => setAttachments((prev) => prev.filter((item) => item.path !== path))}
              hasFigmaConnection={hasFigmaConnection}
              onConnectFigma={() => void connectFigma()}
              onFigmaMode={() => undefined}
              attachments={attachments}
              scrollRef={scrollRef}
            />
          </div>
        </div>
      </div>
      <ProjectPreviewModal
        open={showPreview}
        projectName={project.name}
        available={previewAvailable}
        previewUrl={previewQuery.data?.preview_url}
        routeClass={previewQuery.data?.route_class}
        gatewayUrl={previewQuery.data?.gateway_url}
        isFetching={previewQuery.isFetching}
        message={previewQuery.data?.message}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
