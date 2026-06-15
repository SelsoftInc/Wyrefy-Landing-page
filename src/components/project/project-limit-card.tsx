"use client";

export function LimitCard({ label, current, max, unit }: Readonly<{ label: string; current: number; max: number | string; unit: string }>) {
  const percentage = typeof max === "number" ? Math.min((current / max) * 100, 100) : 0;
  const isInfinite = max === null || max === "" || max === "Unlimited";

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">{label}</p>
          <p className="text-xs font-medium mt-0.5">
            {current} <span className="text-[var(--muted)] font-medium">of {isInfinite ? "∞" : max} {unit} used</span>
          </p>
        </div>
        {!isInfinite && (
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] ${percentage > 90 ? 'text-rose-500' : 'text-[var(--muted)]'}`}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="h-1.5 w-full bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)] shadow-inner">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${percentage > 90 ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-500'}`}
          style={{ width: `${isInfinite ? 0 : percentage}%` }} 
        />
      </div>
    </div>
  );
}
