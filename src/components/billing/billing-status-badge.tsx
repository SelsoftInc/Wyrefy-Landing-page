"use client";

function badgeClass(isPaid: boolean, isPending: boolean) {
  if (isPaid) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (isPending) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-[var(--muted)]/10 text-[var(--muted)] border-[var(--border)]";
}

function dotClass(isPaid: boolean, isPending: boolean) {
  if (isPaid) return "bg-emerald-500";
  if (isPending) return "bg-amber-500";
  return "bg-[var(--muted)]";
}

export function StatusBadge({ status }: Readonly<{ status: string }>) {
  const isPaid = status.toLowerCase() === "paid" || status.toLowerCase() === "active";
  const isPending = status.toLowerCase() === "pending" || status.toLowerCase() === "open";
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${badgeClass(isPaid, isPending)}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass(isPaid, isPending)}`} />
      {status}
    </span>
  );
}
