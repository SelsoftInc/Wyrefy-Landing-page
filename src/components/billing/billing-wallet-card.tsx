"use client";

import { Wallet } from "lucide-react";

type CreditPack = {
  label: string;
  amount: number;
  credits: string;
};

type WalletCardProps = Readonly<{
  creditBalance: string | number;
  lifetimeUsed: string | number;
  heldCredits: string | number;
  creditPacks: CreditPack[];
  onPurchasePack: (pack: CreditPack) => void;
}>;

const creditsFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const credits = (value: string | number) => creditsFormatter.format(Number(value));

export function BillingWalletCard({ 
  creditBalance, 
  lifetimeUsed, 
  heldCredits, 
  creditPacks, 
  onPurchasePack 
}: WalletCardProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem] p-1 shadow-xl transition-all hover:shadow-emerald-500/5">
      <div className="relative z-10 flex h-full flex-col bg-[var(--card)] rounded-[1.9rem] p-6 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Wallet size={14} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">Digital Wallet</p>
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold tracking-tight text-[var(--foreground)] flex items-baseline gap-1">
                {credits(creditBalance)}
                <span className="text-base font-semibold text-[var(--muted)]">CR</span>
              </h2>
            </div>
          </div>
          <div className="text-right pt-1">
            <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Lifetime Used</p>
            <p className="text-xl font-semibold text-[var(--foreground)] flex items-baseline justify-end gap-1">
              {credits(lifetimeUsed)}
              <span className="text-[10px] font-semibold text-[var(--muted)]">CR</span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-6">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--surface)]/40 border border-[var(--border)] p-3.5 transition-colors">
            <div className="size-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            <div>
              <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">In Escrow</p>
              <p className="text-sm font-medium text-[var(--foreground)]/90">{credits(heldCredits)}</p>
            </div>
          </div>
          <button type="button" className="group flex items-center gap-3 rounded-xl bg-[var(--surface)]/40 border border-[var(--border)] p-3.5 transition-all hover:bg-[var(--surface)] hover:border-blue-500/30">
            <div className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] group-hover:scale-125 transition-transform" />
            <div className="text-left">
              <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">Usage History</p>
              <p className="text-sm font-medium text-[var(--foreground)]/90 group-hover:text-blue-500 transition-colors">View Log</p>
            </div>
          </button>
        </div>

        <div className="mt-8">
          <div className="flex flex-col gap-2">
            {creditPacks.slice(0, 3).map((pack) => (
              <button 
                type="button"
                key={pack.label} 
                onClick={() => onPurchasePack(pack)}
                className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 px-4 py-3 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
              >
                <div className="text-left space-y-0.5">
                  <p className="text-xs font-medium text-[var(--foreground)]">Buy {pack.credits} Credits</p>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Single purchase</p>
                </div>
                <p className="text-sm font-medium text-emerald-500">{pack.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -right-20 -bottom-20 size-64 rounded-full bg-emerald-600/5 blur-[80px]" />
    </section>
  );
}
