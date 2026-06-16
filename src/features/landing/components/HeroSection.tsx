"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { BriefcaseBusiness, Users, Zap, ShieldCheck, Wallet, Plus, LayoutGrid, FolderClosed, Plug, CreditCard, Settings } from "lucide-react";
import { BrandLogo } from "@/src/components/ui/brand-logo";
import Grainient from "@/src/components/ui/Grainient";

export function HeroSection({
  onAction,
}: {
  onAction?: () => void;
}) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yHeading = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const ySubtitle = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const yInput = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const yDashboard = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 150]);



  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center pt-32 md:pt-[180px] px-4 md:px-10 w-full overflow-visible perspective-[1200px] pb-12 md:pb-24"
      id="hero"
    >
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden opacity-100" style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 85%, transparent 100%)" }}>
        <Grainient
          color1="#9dbaff"
          color2="#84a9ff"
          color3="#6b95ff"
          contrast={1}
          blendSoftness={1}
          timeSpeed={0.15}
          zoom={0.8}
        />
      </div>

      {/* Text Elements Wrapper */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-4xl mx-auto">
        <motion.div style={{ y: yHeading }} className="flex flex-col items-center justify-center w-full text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 flex justify-center items-center w-full"
          >
            <Image 
              src="/white_wyrefy_logo.png" 
              alt="Wyrefy Logo" 
              width={128} 
              height={128} 
              className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" 
              unoptimized
            />
          </motion.div>

          <div className="relative w-full mb-6 select-none flex items-center justify-center">
            <h1 className="text-6xl md:text-[100px] font-bold text-white drop-shadow-md tracking-tighter text-center leading-none">
              Wyrefy
            </h1>
          </div>
        </motion.div>

        <motion.p
          style={{ y: ySubtitle }}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-white/90 drop-shadow-sm font-medium max-w-2xl mb-12 text-center px-4"
        >
          The autonomous AI workspace that transforms your designs into production-ready software.
        </motion.p>

        <motion.div
          style={{ y: yInput }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-32 relative z-20"
        >
          <motion.button
            onClick={onAction}
            animate={{ 
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 8px 32px rgba(59,130,246,0.1)",
                "0 12px 40px rgba(59,130,246,0.2)",
                "0 8px 32px rgba(59,130,246,0.1)"
              ]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "#ffffff",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(14, 165, 233, 0.6), 0 0 60px rgba(2, 132, 199, 0.4)",
              transition: { duration: 0.15, ease: "easeOut" }
            }}
            className="relative inline-flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md border border-white/80 px-10 py-4 cursor-pointer text-slate-800 font-bold text-lg"
          >
            Start Building
          </motion.button>
        </motion.div>
      </div>

      {/* Dashboard Parallax Wrapper */}
      <motion.div style={{ y: yDashboard, transformStyle: "preserve-3d" }} className="w-full flex justify-center z-10 will-change-transform">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-[95vw] max-w-[1300px] aspect-[16/10] rounded-2xl md:rounded-[32px] p-2 bg-white/40 backdrop-blur-[40px] border-[2px] border-blue-400/60 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.5)] relative z-10 translate-y-12 flex flex-col"
        >
          {/* Inner Dashboard Wrapper */}
          <div className="w-full h-full rounded-xl md:rounded-[24px] bg-white/20 overflow-hidden flex flex-col shadow-inner">
            {/* Header */}
          <div className="h-16 border-b border-white/20 flex items-center px-6 justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo className="size-7 text-blue-500" />
              <span className="text-slate-800 font-bold text-xl tracking-wide">Wyrefy</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end justify-center">
                    <span className="text-blue-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">USER</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
                    A
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-20 hidden md:flex flex-col items-center justify-center gap-6 py-6 border-r border-white/20 bg-transparent">
                <div className="w-10 h-10 rounded-full border border-white bg-white/80 text-blue-600 flex items-center justify-center shadow-sm">
                  <LayoutGrid size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-slate-400 flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-slate-400 flex items-center justify-center">
                  <FolderClosed size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-slate-400 flex items-center justify-center">
                  <Plug size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-slate-400 flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-slate-400 flex items-center justify-center">
                  <Settings size={18} />
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col p-8 gap-8 overflow-hidden bg-transparent relative">
                {/* Decorative background blur inside dashboard */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200/30 rounded-full blur-[60px] pointer-events-none" />

                {/* Header Area */}
                <div className="flex justify-between items-end relative z-10">
                  <div className="relative">
                    <h2 className="text-3xl font-bold text-slate-800 pb-3 tracking-tight">Dashboard</h2>
                    <div className="absolute bottom-0 left-0 w-12 h-[3px] bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center rounded-xl h-11 px-6 border border-white bg-white/60 text-slate-700 text-xs font-semibold backdrop-blur-xl shadow-sm">
                      Workspace
                    </div>
                    <div className="flex items-center justify-center rounded-xl h-11 px-6 bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 gap-2">
                      <Plus size={16} /> New Project
                    </div>
                  </div>
                </div>

                {/* Hero Metrics Grid */}
                <div className="grid gap-6 grid-cols-4 relative z-10">
                  {[
                    { icon: BriefcaseBusiness, title: "ACTIVE PROJECTS", value: "9", badge: "OPERATIONAL", badgeColor: "text-blue-600 border-blue-200 bg-blue-50" },
                    { icon: Users, title: "TEAM MEMBERS", value: "1", badge: "SYNCED", badgeColor: "text-blue-600 border-blue-200 bg-blue-50" },
                    { icon: Zap, title: "LIFETIME USAGE", value: "0.2", badge: "ALL TIME", badgeColor: "text-amber-600 border-amber-200 bg-amber-50" },
                    { icon: ShieldCheck, title: "CREDIT BALANCE", value: "249.80", badge: "PRO", badgeColor: "text-emerald-600 border-emerald-200 bg-emerald-50" }
                  ].map((card, idx) => (
                    <div key={idx} className="rounded-3xl p-6 relative overflow-hidden bg-white/60 backdrop-blur-[20px] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white text-blue-500 shadow-sm">
                          <card.icon size={18} />
                        </div>
                        <div className={`px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest leading-none block">{card.badge}</span>
                        </div>
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{card.title}</p>
                        <h3 className="text-3xl font-semibold text-slate-800 tracking-tight leading-none">{card.value}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Projects Grid */}
                <div className="flex flex-col mt-4 relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-2xl border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-500">
                        <BriefcaseBusiness size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recent Projects</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mt-1">QUICK ACCESS TO YOUR WORKSPACE</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      VIEW ALL ↗
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { name: "Global Payment Gateway", credits: "0.2" },
                      { name: "AI Code Assistant UI", credits: "0" },
                      { name: "Real-time Analytics", credits: "0" },
                      { name: "Enterprise Admin Panel", credits: "0" }
                    ].map((p, i) => (
                      <div key={i} className="rounded-3xl flex flex-col bg-white/60 backdrop-blur-[20px] border border-white p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-8 relative z-10">
                          <div className="size-11 rounded-2xl border border-blue-100 bg-blue-50/50 flex items-center justify-center">
                            <BriefcaseBusiness size={18} className="text-blue-500" />
                          </div>
                        </div>
                        <div className="mb-6 relative z-10">
                          <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">{p.name}</h3>
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-100 relative z-10 mt-auto">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Wallet size={14} className="text-amber-500" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">CREDITS</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 tracking-wider">{p.credits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
