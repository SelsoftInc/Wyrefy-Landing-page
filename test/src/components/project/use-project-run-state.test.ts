import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ProjectAgentRun } from "@/src/features/runtime/types";
import { useProjectRunState } from "@/src/components/project/use-project-run-state";

function run(state: ProjectAgentRun["state"]): ProjectAgentRun {
  return {
    run_record_id: "run-1",
    project_id: "project-1",
    sandbox_session_id: "sandbox-1",
    thread_id: "thread-1",
    actor_user_id: "user-1",
    model_pricing_id: "model-1",
    figma_import_revision_id: null,
    state,
    user_prompt: "test",
    assistant_response: "",
    prompt_summary_json: {},
    checkpoint_json: {},
    error_message: null,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
}

describe("useProjectRunState", () => {
  it("keeps the run busy across start acceptance until terminal completion", () => {
    const { result, rerender } = renderHook(
      ({ activeRun, sandboxState, runs }) => useProjectRunState({ activeRun, sandboxState, runs }),
      { initialProps: { activeRun: undefined, sandboxState: "interactive", runs: [] as ProjectAgentRun[] } },
    );

    act(() => result.current.beginStart());
    expect(result.current.isBusy).toBe(true);
    expect(result.current.localPhase).toBe("starting");

    act(() => result.current.markRunAccepted());
    expect(result.current.localPhase).toBe("running");
    expect(result.current.isBusy).toBe(true);

    rerender({ activeRun: undefined, sandboxState: "interactive", runs: [run("completed")] });
    expect(result.current.isBusy).toBe(false);
    expect(result.current.localPhase).toBe("idle");
  });

  it("holds cancelling state until the terminal run state arrives", () => {
    const active = run("running");
    const { result, rerender } = renderHook(
      ({ activeRun, sandboxState, runs }) => useProjectRunState({ activeRun, sandboxState, runs }),
      { initialProps: { activeRun: active, sandboxState: "agent_running", runs: [active] } },
    );

    act(() => result.current.beginCancel());
    expect(result.current.isBusy).toBe(true);
    expect(result.current.isCancelling).toBe(true);

    rerender({ activeRun: undefined, sandboxState: "interactive", runs: [run("cancelled")] });
    expect(result.current.isBusy).toBe(false);
    expect(result.current.localPhase).toBe("idle");
  });

  it("clears the busy state after completion even if sandbox activity lags behind", () => {
    const active = run("running");
    const { result, rerender } = renderHook(
      ({ activeRun, sandboxState, runs }) => useProjectRunState({ activeRun, sandboxState, runs }),
      { initialProps: { activeRun: active, sandboxState: "agent_running", runs: [active] } },
    );

    act(() => result.current.markRunAccepted());
    expect(result.current.isBusy).toBe(true);
    expect(result.current.localPhase).toBe("running");

    rerender({ activeRun: undefined, sandboxState: "background_running", runs: [run("completed")] });
    expect(result.current.isBusy).toBe(false);
    expect(result.current.localPhase).toBe("idle");
  });

  it("returns to running when cancel fails", () => {
    const { result } = renderHook(() => useProjectRunState({ activeRun: run("running"), sandboxState: "agent_running", runs: [run("running")] }));

    act(() => result.current.beginCancel());
    expect(result.current.localPhase).toBe("cancelling");

    act(() => result.current.markCancelFailed());
    expect(result.current.localPhase).toBe("running");
    expect(result.current.isBusy).toBe(true);
  });
});
