"use client";

import { useEffect, useRef, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/src/features/theme/store";

const themes = [
  { key: "system", label: "Default", Icon: Laptop },
  { key: "light", label: "Light", Icon: Sun },
  { key: "dark", label: "Dark", Icon: Moon },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTheme = themes.find((t) => t.key === theme) || themes[0];
  const CurrentIcon = currentTheme.Icon;

  return (
    <div className="relative z-[1000] hidden" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--foreground)]"
      >
        <CurrentIcon size={16} strokeWidth={2.2} />
        <span className="hidden w-12 text-left sm:inline-block">{currentTheme.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[1001] mt-2 w-36 origin-top-right rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-2xl shadow-black/25 backdrop-blur-xl">
          {themes.map(({ key, label, Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() => {
                setTheme(key);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                theme === key 
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]" 
                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon size={16} strokeWidth={2.2} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
