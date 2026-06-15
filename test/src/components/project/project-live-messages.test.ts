import { describe, expect, it } from "vitest";

import { appendAssistantStreamDelta, completeAssistantStream, startAssistantStream } from "@/src/components/project/project-live-messages";

describe("project live assistant streaming", () => {
  it("starts a pending assistant message once", () => {
    expect(startAssistantStream([])).toEqual([{ role: "agent", content: "", pending: true, runRecordId: undefined }]);
    expect(startAssistantStream([{ role: "agent", content: "", pending: true, runRecordId: undefined }], "run-1")).toEqual([
      { role: "agent", content: "", pending: true, runRecordId: "run-1" },
    ]);
  });

  it("appends delta text onto the pending assistant message", () => {
    expect(appendAssistantStreamDelta([], "run-1", "Hello")).toEqual([{ role: "agent", content: "Hello", pending: true, runRecordId: "run-1" }]);
    expect(appendAssistantStreamDelta([{ role: "agent", content: "Hello", pending: true, runRecordId: "run-1" }], "run-1", " world")).toEqual([
      { role: "agent", content: "Hello world", pending: true, runRecordId: "run-1" },
    ]);
  });

  it("completes the pending assistant message without duplicating it", () => {
    expect(completeAssistantStream([{ role: "agent", content: "Hello world", pending: true, runRecordId: "run-1" }], "run-1", "Hello world")).toEqual([
      { role: "agent", content: "Hello world", pending: false, runRecordId: "run-1" },
    ]);
  });
});
