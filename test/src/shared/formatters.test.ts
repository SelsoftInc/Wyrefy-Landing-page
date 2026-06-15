import { describe, expect, it } from "vitest";

import { compactNumber, formatCredits, shortDate } from "@/src/shared/formatters";

describe("compactNumber", () => {
  it("formats numbers in compact notation", () => {
    expect(compactNumber(0)).toBe("0");
    expect(compactNumber(500)).toBe("500");
    expect(compactNumber(1500)).toBe("1.5K");
    expect(compactNumber(1000000)).toBe("1M");
  });

  it("handles string inputs", () => {
    expect(compactNumber("5000")).toBe("5K");
    expect(compactNumber("0")).toBe("0");
  });

  it("handles edge case values", () => {
    expect(compactNumber(Number.NaN)).toBe("NaN");
  });
});

describe("formatCredits", () => {
  it("formats with 2 decimal places and CR suffix", () => {
    expect(formatCredits(0)).toBe("0.00 CR");
    expect(formatCredits(100)).toBe("100.00 CR");
    expect(formatCredits(100.5)).toBe("100.50 CR");
  });

  it("handles string inputs", () => {
    expect(formatCredits("250")).toBe("250.00 CR");
    expect(formatCredits("99.9")).toBe("99.90 CR");
  });
});

describe("shortDate", () => {
  it("formats dates in short US format", () => {
    expect(shortDate("2026-01-15")).toBe("Jan 15, 2026");
    expect(shortDate("2026-12-01")).toBe("Dec 1, 2026");
  });
});
