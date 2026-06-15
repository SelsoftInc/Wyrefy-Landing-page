import { describe, expect, it } from "vitest";

import { slugify } from "@/src/shared/slugify";

describe("slugify", () => {
  it("converts whitespace and dashes into single separators", () => {
    expect(slugify("  Starter Plan  ")).toBe("starter-plan");
    expect(slugify("team---pro plan")).toBe("team-pro-plan");
  });

  it("keeps ascii letters, digits, and underscores", () => {
    expect(slugify("Plan_2026 Edition")).toBe("plan_2026-edition");
  });

  it("drops punctuation and non-ascii characters without changing behavior", () => {
    expect(slugify("Growth! & Scale++")).toBe("growth-scale");
    expect(slugify("Café Deluxe")).toBe("caf-deluxe");
  });
});
