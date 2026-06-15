"use client";


export type TelemetryListItem = {
  method?: string;
  path: string;
  value: number;
  formattedValue: string;
  percentage?: number;
};

export function TelemetryList({
  items,
  totalLabel,
  colorClassName = "bg-blue-500"
}: Readonly<{
  items: TelemetryListItem[];
  totalLabel?: string;
  colorClassName?: string;
}>) {
  const maxValue = Math.max(...items.map(i => i.value), 1);

  const getGradientClass = (color: string) => {
    if (color.includes("bg-amber")) return "from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.25)]";
    if (color.includes("bg-rose")) return "from-rose-400 to-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.25)]";
    return "from-blue-400 via-sky-400 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.25)]";
  };

  return (
    <div className="space-y-5">
      {totalLabel && (
        <div className="flex justify-end mb-2">
          <p className="text-[10px] font-medium text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10">{totalLabel}</p>
        </div>
      )}
      {items.length > 0 ? items.map((item) => (
        <div key={`${item.method ?? "metric"}-${item.path}`} className="space-y-2 hover:bg-[var(--surface)]/20 p-2 -mx-2 rounded-xl transition-all duration-200 group">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {item.method && (
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium uppercase tracking-tighter shrink-0 border border-current bg-[var(--surface)] ${getMethodColor(item.method)}`}>
                  {item.method}
                </span>
              )}
              <span className="text-[11px] font-medium text-[var(--foreground)] truncate group-hover:text-blue-400 transition-colors" title={item.path}>{item.path}</span>
            </div>
            <div className="flex items-baseline gap-2 shrink-0">
              <span className="text-xs font-medium text-[var(--foreground)]">{item.formattedValue}</span>
              {item.percentage !== undefined && <span className="text-[9px] font-medium text-[var(--muted)]">{item.percentage}%</span>}
            </div>
          </div>
          <div className="h-2 w-full bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]/30 shadow-inner p-[1px]">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getGradientClass(colorClassName)}`} style={{ width: `${(item.value / maxValue) * 100}%` }} />
          </div>
        </div>
      )) : (
        <div className="py-20 text-center opacity-40 italic text-xs font-medium">No activity recorded yet</div>
      )}
    </div>
  );
}

function getMethodColor(method: string) {
  switch (method.toUpperCase()) {
    case "GET": return "text-emerald-500 border-emerald-500/20";
    case "POST": return "text-blue-500 border-blue-500/20";
    case "PUT": return "text-amber-500 border-amber-500/20";
    case "DELETE": return "text-rose-500 border-rose-500/20";
    default: return "text-[var(--muted)] border-[var(--border)]";
  }
}
