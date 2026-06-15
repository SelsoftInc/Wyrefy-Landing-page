"use client";

import { create } from "zustand";

type ThemePreference = "light" | "dark" | "system";

type ThemeState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const storageKey = "wyrefy-theme";

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  // Force light theme permanently as requested
  root.dataset.theme = "light";
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    localStorage.setItem(storageKey, "light");
    applyTheme("light");
    set({ theme: "light" });
  },
}));

export function initializeTheme() {
  useThemeStore.setState({ theme: "light" });
  applyTheme("light");
  
  // Return an empty cleanup function since we no longer listen to system theme changes
  return () => {};
}
