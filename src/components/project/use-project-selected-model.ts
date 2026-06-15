"use client";

import { useEffect } from "react";
import type { ProjectAgentRun, RuntimeModel } from "@/src/features/runtime/types";

const ACTIVE_RUN_STATES = new Set(["queued", "running", "paused"]);

export function activeAgentRun(runs: ProjectAgentRun[]) {
  return runs.findLast((run) => ACTIVE_RUN_STATES.has(run.state));
}

function selectedModelStorageKey(projectId: string) {
  return `wyrefy:project:${projectId}:selected-runtime-model`;
}

export function useProjectSelectedModel({
  projectId,
  models,
  runs,
  selectedModelId,
  setSelectedModelId,
}: Readonly<{
  projectId: string;
  models: RuntimeModel[] | undefined;
  runs: ProjectAgentRun[] | undefined;
  selectedModelId: string;
  setSelectedModelId: (modelId: string) => void;
}>) {
  useEffect(() => {
    const storedModelId = globalThis.localStorage.getItem(selectedModelStorageKey(projectId));
    const modelIds = new Set((models ?? []).map((model) => model.id));
    const latestRunModelId = runs?.findLast((run) => run.model_pricing_id)?.model_pricing_id;
    const nextModelId = [selectedModelId, storedModelId, latestRunModelId, models?.[0]?.id].find((modelId) => modelId && modelIds.has(modelId));
    if (nextModelId && nextModelId !== selectedModelId) setSelectedModelId(nextModelId);
  }, [models, projectId, runs, selectedModelId, setSelectedModelId]);

  useEffect(() => {
    if (selectedModelId) globalThis.localStorage.setItem(selectedModelStorageKey(projectId), selectedModelId);
  }, [projectId, selectedModelId]);
}
