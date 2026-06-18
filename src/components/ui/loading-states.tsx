"use client";

import { AlertTriangle, LockKeyhole, RotateCcw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { BrandLogo } from "@/src/components/ui/brand-logo";

export function AppLoading({ label = "Loading Wyrefy" }: Readonly<{ label?: string }>) {
  return (
    <motion.main 
      initial={{ opacity: 1, scale: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 6, 
        filter: "blur(20px)",
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030305] overflow-hidden select-none origin-center"
    >
      {/* Deep cinematic background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,30,80,0.15)_0%,rgba(3,3,5,1)_70%)] pointer-events-none" />

      {/* Cinematic sweeping light rays */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(3,3,5,0)_0%,rgba(100,150,255,0.05)_50%,rgba(3,3,5,0)_100%)] rounded-full pointer-events-none opacity-50"
      />

      <motion.div 
        exit={{ scale: 20, opacity: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
        className="relative z-10 flex flex-col items-center gap-12 pointer-events-none"
      >
        {/* Cinematic Logo Reveal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          {/* Intense backlight for logo */}
          <motion.div 
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full"
          />
          
          <div className="relative z-10 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(100,150,255,0.1)]">
            <BrandLogo className="size-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </div>

          {/* Slow orbiting particle (cinematic lens flare effect) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-45px]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_15px_3px_#60a5fa]" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-60px]"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-300 rounded-full shadow-[0_0_10px_2px_#818cf8]" />
          </motion.div>
        </motion.div>

        {/* Cinematic Text and Loader */}
        <div className="flex flex-col items-center gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <motion.span 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-[11px] font-medium uppercase tracking-[0.5em] text-white/80"
            >
              {label}
            </motion.span>
          </motion.div>

          {/* Minimalist Cinematic Progress Line */}
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 280 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[1px] rounded-full bg-white/10 overflow-hidden"
          >
            <motion.div 
              animate={{ 
                x: ["-100%", "200%"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_#60a5fa]"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.main>
  );
}

export function SectionLoading({ label = "Loading" }: Readonly<{ label?: string }>) {
  return (
    <div className="relative flex h-full w-full min-h-[60vh] flex-1 flex-col items-center justify-center p-6 select-none bg-transparent overflow-hidden">
      {/* Subtle ambient glow for section */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-400/20 blur-[60px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Core floating cinematic logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center w-24 h-24"
        >
          {/* Orbiting rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-blue-500/20 border-t-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-12px] rounded-full border border-dashed border-indigo-400/30"
          />

          <motion.div 
            animate={{ scale: [1, 1.05, 1], boxShadow: ["0 10px 30px -10px rgba(59,130,246,0.3)", "0 20px 40px -10px rgba(59,130,246,0.5)", "0 10px 30px -10px rgba(59,130,246,0.3)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white shadow-xl flex items-center justify-center"
          >
            <BrandLogo className="size-8 text-blue-600" />
          </motion.div>
        </motion.div>
        
        <div className="flex flex-col items-center gap-5 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span 
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-[10px] font-bold tracking-[0.4em] text-blue-600/80 uppercase"
            >
              {label}
            </motion.span>
          </motion.div>
          <div className="relative h-[2px] w-32 overflow-hidden rounded-full bg-blue-100/50">
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_#3b82f6]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonRows({ rows = 3 }: Readonly<{ rows?: number }>) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }, (_, row) => `skeleton-row-${row + 1}`).map((rowKey) => (
        <div key={rowKey} className="loading-shimmer h-14 rounded-2xl border border-[var(--border)]" />
      ))}
    </div>
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
