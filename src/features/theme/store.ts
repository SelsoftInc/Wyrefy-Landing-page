"use client";

import { create } from "zustand";

type ThemePreference = "light" | "dark" | "system";

type ThemeState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const storageKey = "wyrefy-theme";

function applyTheme() {
  const root = document.documentElement;
  // Force light theme permanently as requested
  root.dataset.theme = "light";
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  setTheme: () => {
    localStorage.setItem(storageKey, "light");
    applyTheme();
    set({ theme: "light" });
  },
}));

export function initializeTheme() {
  useThemeStore.setState({ theme: "light" });
  applyTheme();
  
  // Return an empty cleanup function since we no longer listen to system theme changes
  return () => {};
}
