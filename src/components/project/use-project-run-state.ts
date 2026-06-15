"use client";

import { useMemo, useState } from "react";
import type { ProjectAgentRun } from "@/src/features/runtime/types";

const ACTIVE_RUN_STATES = new Set(["queued", "running", "paused"]);
const ACTIVE_SANDBOX_STATES = new Set(["queued", "agent_running", "background_running"]);
const RUN_BLOCKING_SANDBOX_STATES = new Set(["agent_running", "background_running"]);

export type LocalRunPhase = "idle" | "starting" | "running" | "cancelling";

function latestRunState(runs: ProjectAgentRun[]) {
  return runs.at(-1)?.state ?? null;
}

function hasServerRunActivity(activeRun: ProjectAgentRun | undefined, sandboxState: string, latestState: string | null) {
  const hasActiveRun = Boolean(activeRun) || (latestState ? ACTIVE_RUN_STATES.has(latestState) : false);
  if (hasActiveRun) return true;
  if (isTerminalRunState(latestState) && !activeRun && RUN_BLOCKING_SANDBOX_STATES.has(sandboxState)) return false;
  return ACTIVE_SANDBOX_STATES.has(sandboxState);
}

function isTerminalRunState(state: string | null) {
  return Boolean(state) && !ACTIVE_RUN_STATES.has(state as string);
}

export function useProjectRunState({
  activeRun,
  sandboxState,
  runs,
}: Readonly<{
  activeRun: ProjectAgentRun | undefined;
  sandboxState: string;
  runs: ProjectAgentRun[];
}>) {
  const [localPhase, setLocalPhase] = useState<LocalRunPhase>("idle");
  const latestState = latestRunState(runs);
  const serverActive = useMemo(() => hasServerRunActivity(activeRun, sandboxState, latestState), [activeRun, sandboxState, latestState]);
  const resolvedPhase = !serverActive && ["starting", "running", "cancelling"].includes(localPhase) && isTerminalRunState(latestState)
    ? "idle"
    : localPhase;

  return {
    localPhase: resolvedPhase as LocalRunPhase,
    serverActive,
    isBusy: resolvedPhase !== "idle" || serverActive,
    isCancelling: resolvedPhase === "cancelling",
    beginStart: () => setLocalPhase("starting"),
    markRunAccepted: () => setLocalPhase("running"),
    markRunFailed: () => setLocalPhase("idle"),
    beginCancel: () => setLocalPhase("cancelling"),
    markCancelFailed: () => setLocalPhase("running"),
    markTerminal: () => setLocalPhase("idle"),
  };
}
