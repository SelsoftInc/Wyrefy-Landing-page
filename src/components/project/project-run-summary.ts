import type { ProjectAgentRun } from "@/src/features/runtime/types";

type RunStatusSummary = {
  summary: string;
  steps: string[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function changedFileSteps(mutationSummary: Record<string, unknown>): string[] {
  const latest = Array.isArray(mutationSummary.latest_by_path) ? mutationSummary.latest_by_path : [];
  return latest
    .flatMap((item) => {
      const row = asRecord(item);
      const path = asString(row.path);
      if (!path) return [];
      const success = row.success === true;
      return [success ? `Updated ${path}` : `Failed ${path}`];
    })
    .slice(0, 4);
}

function usageStep(checkpoint: Record<string, unknown>): string | null {
  const usage = asRecord(checkpoint.usage);
  const input = asNumber(usage.input_tokens);
  const output = asNumber(usage.output_tokens);
  if (input <= 0 && output <= 0) return null;
  return `Tokens: ${input.toLocaleString()} in / ${output.toLocaleString()} out`;
}

function runSummaryLabel(run: ProjectAgentRun): string {
  if (run.state === "failed") return "Run failed";
  if (run.state === "cancelled") return "Run cancelled";
  if (run.state === "paused") return "Approval required";
  if (run.state === "running") return "Run in progress";
  return "Run completed";
}

export function buildHistoricalRunSummary(run: ProjectAgentRun): RunStatusSummary | null {
  const checkpoint = asRecord(run.checkpoint_json);
  const selectedModel = asRecord(checkpoint.selected_model);
  const attachmentSummary = asRecord(checkpoint.attachment_summary);
  const mutationSummary = asRecord(checkpoint.mutation_summary);
  const steps: string[] = [];

  const modelName = asString(selectedModel.model_name) || asString(selectedModel.model_id);
  if (modelName) steps.push(`Model: ${modelName}`);

  const attachmentCount = asNumber(attachmentSummary.attachment_count);
  if (attachmentCount > 0) {
    steps.push(`Attachments: ${attachmentCount}`);
  }

  steps.push(...changedFileSteps(mutationSummary));

  const warning = asString(checkpoint.mutation_warning);
  if (warning) steps.push(`Warning: ${warning}`);

  const usage = usageStep(checkpoint);
  if (usage) steps.push(usage);

  if (run.state === "failed" && run.error_message?.trim()) {
    steps.push(`Error: ${run.error_message.trim()}`);
  }
  if (run.state === "cancelled") {
    steps.push("Cancelled before completion");
  }
  if (run.state === "paused") {
    steps.push("Waiting for required approval");
  }

  return steps.length > 0 ? { summary: runSummaryLabel(run), steps } : null;
}
