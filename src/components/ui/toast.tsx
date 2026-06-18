"use client";

import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";
type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};
type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastClass(tone: ToastTone) {
  if (tone === "error") return "border-red-500/30 bg-[var(--card)]/95 shadow-[0_8px_30px_rgba(239,68,68,0.2)]";
  if (tone === "success") return "border-emerald-500/30 bg-[var(--card)]/95 shadow-[0_8px_30px_rgba(16,185,129,0.2)]";
  return "border-blue-500/30 bg-[var(--card)]/95 shadow-[0_8px_30px_rgba(59,130,246,0.2)]";
}

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === "error") return <AlertCircle size={20} className="text-red-500" />;
  if (tone === "success") return <CheckCircle2 size={20} className="text-emerald-500" />;
  return <Info size={20} className="text-blue-500" />;
}

function ToastItemComponent({ toast, removeToast }: Readonly<{ toast: ToastItem; removeToast: (id: number) => void }>) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => removeToast(toast.id), 400); // Allow time for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const handleManualClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(toast.id), 400);
  };

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden flex w-full items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-medium backdrop-blur-xl shadow-2xl transition-all ${toastClass(toast.tone)} ${
        isLeaving 
          ? "animate-out fade-out zoom-out-95 slide-out-to-right-10 duration-300 ease-in"
          : "animate-in fade-in zoom-in-95 slide-in-from-right-10 duration-500 ease-out hover:scale-[1.02]"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      <div className="mt-0.5 shrink-0">
        <ToastIcon tone={toast.tone} />
      </div>
      <span className="flex-1 leading-snug text-[var(--foreground)] mt-0.5 pr-2">{toast.message}</span>
      <button 
        type="button" 
        onClick={handleManualClose} 
        className="mt-0.5 shrink-0 rounded-full p-1 opacity-50 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, tone }].slice(-5));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-6 right-6 sm:top-8 sm:right-8 z-[9999] flex w-[calc(100vw-3rem)] sm:w-auto sm:min-w-[320px] sm:max-w-sm flex-col items-end gap-3">
        {toasts.map((toast) => (
          <ToastItemComponent key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = use(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
