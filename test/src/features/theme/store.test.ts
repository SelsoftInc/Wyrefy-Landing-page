import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initializeTheme, useThemeStore } from "@/src/features/theme/store";

describe("useThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with system theme", () => {
    const { result } = renderHook(() => useThemeStore((state) => state.theme));
    expect(result.current).toBe("system");
  });

  it("sets a new theme", () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem("wyrefy-theme")).toBe("dark");
  });

  it("sets light theme", () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("initializeTheme reads from localStorage", () => {
    localStorage.setItem("wyrefy-theme", "light");
    const cleanup = initializeTheme();

    expect(document.documentElement.dataset.theme).toBe("light");

    cleanup();
  });

  it("initializeTheme uses system default when nothing is stored", () => {
    const cleanup = initializeTheme();

    expect(document.documentElement.dataset.theme).toBe("light");

    cleanup();
  });
});
