"use client";

import { Eye, EyeOff, ChevronDown, Search } from "lucide-react";
import React, { useState, useEffect, useRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { createPortal } from "react-dom";

type FieldProps = Readonly<{
  label?: string;
  name?: string;
  className?: string;
}>;

export type SearchableSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type SearchableSelectFieldProps = FieldProps & {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
};

function inputTypeFor(type: string | undefined, showPassword: boolean) {
  if (type !== "password") return type;
  return showPassword ? "text" : "password";
}

function useFloatingMenuPosition() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLLabelElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideContainer = containerRef.current?.contains(event.target as Node) === false;
      const isOutsideMenu = menuRef.current?.contains(event.target as Node) !== true;
      if (isOutsideContainer && isOutsideMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function openFromButton(button: HTMLButtonElement) {
    const rect = button.getBoundingClientRect();
    setPosition({
      top: rect.bottom + globalThis.scrollY,
      left: rect.left + globalThis.scrollX,
      width: rect.width,
    });
    setIsOpen(true);
  }

  return { containerRef, isOpen, menuRef, openFromButton, position, setIsOpen };
}

export function TextField({ label, name, type, className = "", ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = inputTypeFor(type, show);
  const inputValue = props.value ?? "";

  return (
    <label className={`flex flex-col gap-1.5 sm:gap-2 text-left ${className}`}>
      {label && (
        <span className="text-sm font-medium text-[var(--foreground)]">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </span>
      )}
      <div className="relative">
        <input
          suppressHydrationWarning
          name={name}
          type={inputType}
          className={`input-field ${isPassword ? "pr-12" : ""}`}
          {...props}
          value={props.value === undefined ? undefined : inputValue}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-0 bottom-0 my-auto h-fit flex items-center justify-center rounded-full p-2 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}

export function SelectField({ label, name, className = "", children, defaultValue, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const [localValue, setLocalValue] = useState<string | number | readonly string[]>(defaultValue ?? props.value ?? "");
  const { containerRef, isOpen, menuRef, openFromButton, position, setIsOpen } = useFloatingMenuPosition();
  const selectedValue = props.value ?? localValue;

  const options = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<{ value?: string | number | readonly string[], children?: React.ReactNode }> => React.isValidElement(child) && child.type === "option"
  );

  const selectedOption = options.find((opt) => String(opt.props.value) === String(selectedValue)) || options[0];
  const displayValue = selectedOption ? selectedOption.props.children : "Select...";

  return (
    <label className={`flex flex-col gap-1.5 sm:gap-2 text-left relative ${className}`} ref={containerRef}>
      {label && (
        <span className="text-sm font-medium text-[var(--foreground)]">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </span>
      )}
      <select
        name={name}
        className="hidden"
        value={selectedValue}
        onChange={(event) => {
          setLocalValue(event.target.value);
          props.onChange?.(event);
        }}
        {...props}
      >
        {children}
      </select>
      <div className={`relative ${isOpen ? "z-[100]" : "z-auto"}`}>
        <button
          type="button"
          onClick={(event) => {
            if (isOpen) {
              setIsOpen(false);
              return;
            }
            openFromButton(event.currentTarget);
          }}
          aria-label={label ?? "Select option"}
          className="input-field flex w-full items-center justify-between !appearance-none bg-transparent"
        >
          <span>{displayValue}</span>
          <ChevronDown size={16} className={`text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && typeof document !== "undefined" && createPortal(
          <div
            ref={menuRef}
            className="absolute z-[100000] mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{ top: position.top, left: position.left, width: position.width }}
          >
            {options.map((option) => (
              <button
                key={String(option.props.value)}
                type="button"
                className={`flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:bg-[var(--foreground)]/5 ${String(selectedValue) === String(option.props.value) ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                onClick={(event) => {
                  event.preventDefault();
                  setLocalValue(option.props.value ?? "");
                  setIsOpen(false);
                  if (props.onChange) {
                    const syntheticEvent = {
                      target: { value: option.props.value, name },
                      currentTarget: { value: option.props.value, name },
                    } as unknown as React.ChangeEvent<HTMLSelectElement>;
                    props.onChange(syntheticEvent);
                  }
                }}
              >
                {option.props.children}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>
    </label>
  );
}

export function SearchableSelectField({
  className = "",
  disabled = false,
  emptyMessage = "No options found.",
  label,
  name,
  onChange,
  options,
  placeholder = "Search or select...",
  required = false,
  value,
}: SearchableSelectFieldProps) {
  const [query, setQuery] = useState("");
  const { containerRef, isOpen, menuRef, openFromButton, position, setIsOpen } = useFloatingMenuPosition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      globalThis.setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value) ?? null;
  const filteredOptions = options.filter((option) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return `${option.label} ${option.description ?? ""}`.toLowerCase().includes(normalizedQuery);
  });

  return (
    <label className={`flex flex-col gap-1.5 sm:gap-2 text-left relative ${className}`} ref={containerRef}>
      {label && (
        <span className="text-sm font-medium text-[var(--foreground)]">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      )}
      <input name={name} type="hidden" value={value} required={required} />
      <div className={`relative ${isOpen ? "z-[100]" : "z-auto"}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            if (disabled) return;
            if (isOpen) {
              setIsOpen(false);
              return;
            }
            openFromButton(event.currentTarget);
          }}
          aria-label={label ?? placeholder}
          className="input-field flex w-full items-center justify-between !appearance-none bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={selectedOption ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown size={16} className={`text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && typeof document !== "undefined" && createPortal(
          <div
            ref={menuRef}
            className="absolute z-[100000] mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{ top: position.top, left: position.left, width: position.width }}
          >
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 px-3 py-2 text-[var(--muted)]">
              <Search size={14} />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm font-medium text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <div className="mt-2 max-h-64 overflow-y-auto custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm font-medium text-[var(--muted)]">{emptyMessage}</div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex w-full flex-col items-start rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all hover:bg-[var(--foreground)]/5 ${value === option.value ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {option.description ? <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{option.description}</span> : null}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </label>
  );
}

export function TextareaField({ label, name, className = "", ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`flex flex-col gap-1.5 sm:gap-2 text-left ${className}`}>
      {label && (
        <span className="text-sm font-medium text-[var(--foreground)]">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </span>
      )}
      <textarea name={name} className="input-field" {...props} />
    </label>
  );
}
