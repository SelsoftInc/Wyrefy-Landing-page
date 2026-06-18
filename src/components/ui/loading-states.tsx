"use client";

import { AlertTriangle, LockKeyhole, RotateCcw } from "lucide-react";
import Link from "next/link";
import { LazyMotion, domAnimation, m as motion } from "motion/react";

import { BrandLogo } from "@/src/components/ui/brand-logo";

export function AppLoading({ label = "Loading Wyrefy" }: Readonly<{ label?: string }>) {
  return (
    <LazyMotion features={domAnimation}>
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 bg-[#FAF9FD] overflow-hidden select-none">
      {/* Background animated gradient glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/40 blur-[100px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center gap-10">
        
        {/* Core animated logo container */}
        <div className="relative flex items-center justify-center w-32 h-32">
          
          {/* Orbiting rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-[#6836E1]/30"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-15px] rounded-full border border-[#6836E1]/10"
          />
          
          {/* Breathing Logo */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 bg-white p-4 rounded-2xl shadow-xl shadow-indigo-500/10 border border-slate-100 flex items-center justify-center"
          >
            <BrandLogo className="size-12 text-[#6836E1]" />
          </motion.div>
        </div>

        {/* Text and progress */}
        <div className="flex flex-col items-center gap-5">
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm font-bold uppercase tracking-[0.2em] text-[#6836E1]"
          >
            {label}
          </motion.div>

          {/* Advanced Progress Bar */}
          <div className="relative h-1 w-48 overflow-hidden rounded-full bg-slate-200/60 shadow-inner">
            <motion.div 
              animate={{ 
                x: ["-100%", "100%"]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#6836E1] to-transparent"
            />
          </div>
        </div>

      </div>
    </main>
    </LazyMotion>
  );
}
type AccessStateProps = Readonly<{
  title: string;
  message: string;
  href?: string;
  actionLabel?: string;
  kind?: "forbidden" | "not-found";
}>;

export function AccessState({ title, message, href = "/login", actionLabel = "Continue", kind = "forbidden" }: AccessStateProps) {
  const Icon = kind === "forbidden" ? LockKeyhole : AlertTriangle;
  return (
    <main className="blue-atmosphere flex min-h-screen items-center justify-center px-6 text-[var(--foreground)]">
      <section className="glass-panel page-motion max-w-md rounded-[2rem] p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--accent)]">
          <Icon size={26} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-[var(--muted)]">{message}</p>
        <Link href={href} className="primary-button mt-6 inline-flex items-center gap-2">
          <RotateCcw size={17} />
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
