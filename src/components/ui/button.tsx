"use client";

import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = Readonly<ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}>;

export function Button({ 
  children, 
  loading, 
  icon, 
  variant = "primary", 
  className = "", 
  disabled, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-[var(--accent)] text-white shadow-lg shadow-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(14,165,233,0.6),0_0_60px_rgba(2,132,199,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none",
    secondary: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(14,165,233,0.6),0_0_60px_rgba(2,132,199,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0",
    danger: "border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(14,165,233,0.6),0_0_60px_rgba(2,132,199,0.4)]",
    ghost: "text-[var(--muted)] hover:text-[var(--foreground)] transition-colors hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(14,165,233,0.6),0_0_60px_rgba(2,132,199,0.4)]",
  };

  return (
    <button
      type="button"
      className={`relative flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${variants[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Processing…</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
