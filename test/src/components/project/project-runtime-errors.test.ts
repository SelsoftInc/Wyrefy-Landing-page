import { describe, expect, it } from "vitest";

import { historyToMessages } from "@/src/components/project/project-agent-events";
import { projectRuntimeErrorMessage } from "@/src/components/project/project-runtime-errors";
import type { ProjectAgentRun } from "@/src/features/runtime/types";

function failedRun(errorMessage: string): ProjectAgentRun {
  return {
    run_record_id: "run-1",
    project_id: "project-1",
    sandbox_session_id: "sandbox-1",
    thread_id: "thread-1",
    actor_user_id: "user-1",
    model_pricing_id: "model-1",
    figma_import_revision_id: null,
    state: "failed",
    user_prompt: "debug this",
    assistant_response: "",
    prompt_summary_json: {},
    checkpoint_json: {},
    error_message: errorMessage,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
}

describe("project runtime error sanitization", () => {
  it("preserves explicit local user-actionable messages", () => {
    expect(projectRuntimeErrorMessage(new Error("Connect Figma before importing a Figma link."), "Internal Error")).toBe(
      "Connect Figma before importing a Figma link.",
    );
  });

  it("replaces backend failure details with safe fallback copy", () => {
    expect(projectRuntimeErrorMessage(new Error("Traceback: postgres connection failed"), "Attachment upload failed")).toBe(
      "Attachment upload failed",
    );
  });

  it("masks stored run failure details in chat history", () => {
    expect(historyToMessages([failedRun("Traceback: sandbox failed to hydrate workspace")])).toEqual([
      { role: "user", content: "debug this" },
      { role: "status", content: "Agent run failed" },
    ]);
  });
});
