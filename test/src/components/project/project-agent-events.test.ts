import { describe, expect, it } from "vitest";

import { historyToMessages, mergeChatMessages, type ChatMessage } from "@/src/components/project/project-agent-events";
import { appendRuntimeMessage } from "@/src/components/project/project-live-thread-state";

describe("mergeChatMessages", () => {
  it("keeps a repeated live user prompt visible until the matching run reaches history", () => {
    const priorHistory: ChatMessage[] = [
      { role: "user", content: "Repeat this prompt" },
      { role: "agent", content: "First response" },
    ];
    const liveMessages: ChatMessage[] = [
      { role: "user", content: "Repeat this prompt", reconcileAfterRunCount: 2 },
    ];

    expect(mergeChatMessages(priorHistory, liveMessages, 1)).toEqual([...priorHistory, liveMessages[0]]);

    const reconciledHistory: ChatMessage[] = [
      ...priorHistory,
      { role: "user", content: "Repeat this prompt" },
      { role: "agent", content: "Second response" },
    ];

    expect(mergeChatMessages(reconciledHistory, liveMessages, 2)).toEqual(reconciledHistory);
  });

  it("reconciles streamed assistant output by run record id after history refresh", () => {
    const history: ChatMessage[] = [{ role: "agent", content: "Final response", runRecordId: "run-1" }];
    const live: ChatMessage[] = [{ role: "agent", content: "Final response", runRecordId: "run-1", reconcileAfterRunCount: 1 }];

    expect(mergeChatMessages(history, live, 1)).toEqual(history);
  });

  it("keeps the live user prompt above same-run status and pending agent updates", () => {
    const liveMessages: ChatMessage[] = [
      { role: "user", content: "Can you create those components as cards", reconcileAfterRunCount: 1 },
      { role: "status", content: "Agent run started.", runRecordId: "run-1" },
      { role: "agent", content: "", pending: true, runRecordId: "run-1", reconcileAfterRunCount: 1 },
    ];

    expect(mergeChatMessages([], liveMessages, 0)).toEqual([
      { role: "user", content: "Can you create those components as cards", reconcileAfterRunCount: 1 },
      { role: "status", content: "Agent run started.", runRecordId: "run-1", statusSteps: ["Agent run started."] },
      { role: "agent", content: "", pending: true, runRecordId: "run-1", reconcileAfterRunCount: 1 },
    ]);
  });
});

describe("historyToMessages", () => {
  it("keeps only persisted user and agent messages from history", () => {
    const messages = historyToMessages([
      {
        run_record_id: "run-1",
        project_id: "project-1",
        sandbox_session_id: "sandbox-1",
        thread_id: "thread-1",
        actor_user_id: null,
        model_pricing_id: null,
        figma_import_revision_id: null,
        state: "completed",
        user_prompt: "Ship it",
        assistant_response: "Done",
        prompt_summary_json: {},
        checkpoint_json: {
          selected_model: { model_name: "GPT-5" },
          attachment_summary: { attachment_count: 2 },
          mutation_summary: { latest_by_path: [{ path: "client/app/page.tsx", success: true }] },
        },
        error_message: null,
        created_at: "2026-06-13T00:00:00Z",
        completed_at: "2026-06-13T00:01:00Z",
      },
    ]);

    expect(messages).toEqual([
      { role: "user", content: "Ship it", runRecordId: "run-1" },
      { role: "agent", content: "Done", runRecordId: "run-1" },
    ]);
  });
});

describe("appendRuntimeMessage", () => {
  it("keeps the pending assistant bubble while status updates arrive", () => {
    const result = appendRuntimeMessage(
      [{ role: "agent", content: "", pending: true, runRecordId: "run-1" }],
      { role: "status", content: "Working: read file", runRecordId: "run-1" },
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ role: "agent", pending: true, runRecordId: "run-1" });
    expect(result[1]).toMatchObject({ role: "status", content: "Working: read file", runRecordId: "run-1" });
  });
});
