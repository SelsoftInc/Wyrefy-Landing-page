"use client";

import { useEffect, useState } from "react";

type RankedItem = {
  method?: string;
  path: string;
  value: number;
  formattedValue: string;
  percentage?: number;
};

export function RankedListCard({
  title,
  subtitle,
  items,
  totalLabel,
  colorClassName = "bg-[var(--accent)]",
}: Readonly<{
  title: string;
  subtitle?: string;
  items: RankedItem[];
  totalLabel?: string;
  colorClassName?: string;
}>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <section className="glass-card flex flex-col rounded-[2rem] p-6 transition-all hover:shadow-xl hover:shadow-[var(--accent)]/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
          {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mt-0.5">{subtitle}</p>}
        </div>
        {totalLabel && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Total</p>
            <p className="text-lg font-semibold text-[var(--accent)] leading-none mt-1">{totalLabel}</p>
          </div>
        )}
      </div>

      <div data-lenis-prevent="true" className="mt-8 space-y-5 flex-1 overflow-y-auto max-h-[260px] pr-2 scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-transparent">
        {items.length > 0 ? (
          items.map((item, i) => (
            <div key={`${item.method}-${item.path}-${i}`} className="space-y-2 group">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {item.method && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium uppercase tracking-tighter shrink-0 border border-current ${getMethodColor(item.method)}`}>
                      {item.method}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-[var(--foreground)] truncate" title={item.path}>
                    {item.path}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="text-xs font-medium text-[var(--foreground)]">{item.formattedValue}</span>
                  {item.percentage !== undefined && (
                    <span className="text-[9px] font-medium text-[var(--muted)]">{item.percentage}%</span>
                  )}
                </div>
              </div>
              <div className="h-1.5 w-full bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)] shadow-inner relative">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${colorClassName}`}
                  style={{ 
                    width: mounted ? `${(item.value / maxValue) * 100}%` : "0%",
                    transitionDelay: `${i * 50}ms`
                  }} 
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-center opacity-50">
            <p className="text-xs font-medium text-[var(--muted)] italic">Telemetry data unavailable</p>
          </div>
        )}
      </div>
    </section>
  );
}

function getMethodColor(method: string) {
  switch (method.toUpperCase()) {
    case "GET": return "bg-emerald-500/5 text-emerald-500 border-emerald-500/20";
    case "POST": return "bg-blue-500/5 text-blue-500 border-blue-500/20";
    case "PUT": return "bg-amber-500/5 text-amber-500 border-amber-500/20";
    case "DELETE": return "bg-rose-500/5 text-rose-500 border-rose-500/20";
    default: return "bg-[var(--muted)]/5 text-[var(--muted)] border-[var(--border)]";
  }
}
