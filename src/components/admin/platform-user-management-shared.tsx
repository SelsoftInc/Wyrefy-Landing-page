"use client";

import { Settings2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { SelectField } from "@/src/components/ui/form-field";

export type AdminAction = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

function useCloseOnOutsideClick(menuRef: { current: HTMLDivElement | null }, setIsOpen: (open: boolean) => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef, setIsOpen]);
}

export function AdminActionMenu({ actions, ariaLabel = "Row actions" }: Readonly<{ actions: AdminAction[]; ariaLabel?: string }>) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsideClick(menuRef, setIsOpen);

  return (
    <div className={`relative flex justify-center ${isOpen ? "z-[100]" : "z-auto"}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={(event) => {
          if (!isOpen) {
            const rect = event.currentTarget.getBoundingClientRect();
            setPosition({
              top: rect.bottom + globalThis.scrollY,
              right: globalThis.innerWidth - rect.right - globalThis.scrollX,
            });
          }
          setIsOpen(!isOpen);
        }}
        className="rounded-full p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
      >
        <Settings2 size={18} />
      </button>
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{ top: position.top, right: position.right }}
          className="absolute z-[101] mt-2 w-52 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={action.disabled}
              onClick={() => {
                if (action.disabled) return;
                action.onClick();
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${action.destructive ? "text-red-500 hover:bg-red-500/10" : "text-[var(--foreground)] hover:bg-[var(--foreground)]/5"} ${action.disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {action.destructive ? <Trash2 size={16} /> : null}
              {action.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

export function RoleSelect({ value, onChange }: Readonly<{ value: string; onChange: (value: string) => void }>) {
  return (
    <SelectField
      value={value}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
      className="w-32"
    >
      <option value="organization_owner">Owner</option>
      <option value="organization_admin">Admin</option>
      <option value="organization_member">Member</option>
    </SelectField>
  );
}

export function formatCredits(value: string | number | null | undefined) {
  const numericValue = Number(value ?? 0);
  return numericValue.toLocaleString("en-US", {
    minimumFractionDigits: numericValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  });
}

export function formatCount(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-US");
}

export function formatComputeUsage(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);
  return numericValue.toLocaleString("en-US", {
    minimumFractionDigits: numericValue === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  });
}
