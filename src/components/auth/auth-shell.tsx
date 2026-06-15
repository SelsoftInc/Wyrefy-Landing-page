import { BrandLogo } from "@/src/components/ui/brand-logo";
import { ThemeSwitcher } from "@/src/components/ui/theme-switcher";

export function AuthShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="blue-atmosphere relative page-motion grid min-h-screen place-items-center px-4 sm:px-6 py-6 sm:py-8 text-[var(--foreground)]">
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--background)]" />
      
      <div className="fixed right-4 top-4 sm:right-6 sm:top-6 z-[120]">
        <ThemeSwitcher />
      </div>
      <section className="relative z-10 motion-rise w-full max-w-[380px]">
        <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
          <BrandLogo className="size-8 sm:size-10" />
          <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold">Wyrefy</p>
          <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs font-medium text-[var(--muted)]">Build production interfaces from product intent.</p>
        </div>
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6">{children}</div>
      </section>
    </main>
  );
}
