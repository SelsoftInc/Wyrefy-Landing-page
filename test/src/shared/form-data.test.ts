import { describe, expect, it } from "vitest";

import { formString } from "@/src/shared/form-data";

describe("formString", () => {
  it("returns the string value for a text field", () => {
    const data = new FormData();
    data.set("name", "Acme");
    expect(formString(data, "name")).toBe("Acme");
  });

  it("returns fallback when field is missing", () => {
    const data = new FormData();
    expect(formString(data, "missing")).toBe("");
  });

  it("returns custom fallback when field is missing", () => {
    const data = new FormData();
    expect(formString(data, "missing", "default")).toBe("default");
  });

  it("returns fallback when value is not a string", () => {
    const data = new FormData();
    data.set("file", new Blob(["test"]));
    expect(formString(data, "file")).toBe("");
  });

  it("returns fallback when file is passed", () => {
    const data = new FormData();
    data.set("upload", new File([""], "test.txt"));
    expect(formString(data, "upload", "nope")).toBe("nope");
  });
});
