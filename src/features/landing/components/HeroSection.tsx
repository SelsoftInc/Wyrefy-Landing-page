"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { BriefcaseBusiness, Users, Zap, ShieldCheck, Wallet, Plus, LayoutGrid, FolderClosed, Plug, CreditCard, Settings } from "lucide-react";
import { BrandLogo } from "@/src/components/ui/brand-logo";
import GlassSurface from "@/src/components/ui/GlassSurface";
import { TextPressure } from "./TextPressure";

export function HeroSection({
  isAuthenticated,
  onAction,
}: {
  isAuthenticated?: boolean;
  onAction?: () => void;
}) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yHeading = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const ySubtitle = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yInput = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const yDashboard = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 250]);

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalized values between -1 and 1
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Parallax offsets based on mouse
  const bgX = useTransform(smoothMouseX, [-1, 1], [-30, 30]);
  const bgY = useTransform(smoothMouseY, [-1, 1], [-30, 30]);

  const textX = useTransform(smoothMouseX, [-1, 1], [-15, 15]);
  const textY = useTransform(smoothMouseY, [-1, 1], [-15, 15]);

  const dashRotateX = useTransform(smoothMouseY, [-1, 1], [8, -8]);
  const dashRotateY = useTransform(smoothMouseX, [-1, 1], [-8, 8]);
  const dashX = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const dashY = useTransform(smoothMouseY, [-1, 1], [-20, 20]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col items-center pt-24 md:pt-32 px-4 md:px-10 w-full overflow-visible perspective-[1200px] pb-12 md:pb-24 -mb-[150px] md:-mb-[250px]"
      id="hero"
    >
      <style>{`
        .btn-spinning-border-mask {
          position: absolute;
          inset: 0;
          border-radius: 32px;
          padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          overflow: hidden;
          pointer-events: none;
        }

        .btn-spinning-border-glow {
          position: absolute;
          inset: -150%;
          background: conic-gradient(from 0deg, transparent 0%, transparent 60%, #00d2ff 80%, #5227FF 100%);
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Background Image Parallax Wrapper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ y: yBg, x: bgX, translateY: bgY, scale: 1.05 }}
        className="absolute top-[-100px] left-0 right-0 h-[120vh] z-0 pointer-events-none will-change-transform"
      >
        <video
          src="/Energy_beam_expands_on_horizon_202606121351.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center"
        />
        {/* Darkening overlay with a light dark blur */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        {/* Subtle gradient to blend bottom smoothly into the white page */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 via-80% to-white"></div>
      </motion.div>

      {/* Text Elements Wrapper */}
      <motion.div
        style={{ x: textX, y: textY }}
        className="relative z-20 flex flex-col items-center w-full max-w-4xl mx-auto will-change-transform"
      >
        {/* Logo & Heading Wrapper to keep them aligned together */}
        <motion.div style={{ y: yHeading }} className="flex flex-col items-center justify-center w-full text-center">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 flex justify-center items-center w-full"
          >
            <BrandLogo className="w-28 h-28 md:w-40 md:h-40 text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]" />
          </motion.div>

          {/* Heading */}
          <div className="relative w-full h-[100px] md:h-[160px] mb-8 select-none flex items-center justify-center">
            <TextPressure
              text="WYREFY"
              fontFamily="var(--font-outfit), sans-serif"
              minFontSize={70}
              maxFontSize={130}
              flex={false}
            />
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          style={{ y: ySubtitle }}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-white font-medium max-w-2xl mb-12 text-center px-4 will-change-transform"
        >
          The autonomous AI workspace that transforms your designs into production-ready software.
        </motion.p>

        {/* Call to Action Button */}
        <motion.div
          style={{ y: yInput }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-36 relative z-20 will-change-transform"
        >
          <button
            onClick={onAction}
            className="group relative inline-flex items-center justify-center rounded-[32px] no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.4)] border-none p-0 cursor-pointer overflow-hidden"
            type="button"
            style={{ appearance: "none" }}
          >
            <span className="btn-spinning-border-mask">
              <span className="btn-spinning-border-glow"></span>
            </span>
            <GlassSurface
              width={260}
              height={64}
              borderRadius={32}
              displace={15}
              distortionScale={-150}
              redOffset={5}
              greenOffset={15}
              blueOffset={25}
              brightness={100}
              opacity={0.95}
              mixBlendMode="normal"
              className="relative z-10 border border-blue-500 bg-blue-600 group-hover:bg-blue-700 transition-colors"
            >
              <span className="text-white text-lg font-bold flex items-center justify-center w-full h-full">
                {isAuthenticated ? "Go to Dashboard" : "Start Building"}
              </span>
            </GlassSurface>
          </button>
        </motion.div>
      </motion.div>

      {/* Dashboard Parallax Wrapper */}
      <motion.div style={{ y: yDashboard, x: dashX, translateY: dashY, rotateX: dashRotateX, rotateY: dashRotateY, transformStyle: "preserve-3d" }} className="w-full flex justify-center z-10 will-change-transform">
        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-[95vw] max-w-[1300px] aspect-[16/10] rounded-2xl md:rounded-[32px] p-2 bg-white/90 border border-slate-200 shadow-[0_30px_100px_rgba(59,130,246,0.08),0_10px_30px_rgba(59,130,246,0.04)] relative z-10 translate-y-12"
        >
          {/* Inner Dashboard Wrapper */}
          <div className="w-full h-full rounded-xl md:rounded-[24px] bg-[#0A0D18]/90 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-[#080B14]">
              <div className="flex items-center gap-3">
                <BrandLogo className="size-7 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-white font-bold text-xl tracking-wide">Wyrefy</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-white text-xs font-bold leading-none">Sibi</span>
                    <span className="text-blue-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">USER</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    S
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-20 hidden md:flex flex-col items-center justify-center gap-6 py-6 border-r border-white/5 bg-[#080B14]">
                <div className="w-10 h-10 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)] relative">
                  <LayoutGrid size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors">
                  <Users size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors">
                  <FolderClosed size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors">
                  <Plug size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors">
                  <CreditCard size={18} />
                </div>
                <div className="w-10 h-10 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors">
                  <Settings size={18} />
                </div>
              </div>

              {/* Main Content Area replacing the mock */}
              <div className="flex-1 flex flex-col p-8 gap-8 overflow-hidden bg-[#0A0D18]">
                {/* Header Area */}
                <div className="flex justify-between items-end">
                  <div className="relative">
                    <h2 className="text-3xl font-bold text-white pb-3 tracking-tight">Dashboard</h2>
                    <div className="absolute bottom-0 left-0 w-12 h-[3px] bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center rounded-xl h-11 px-6 border border-white/10 bg-transparent text-white text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer">
                      Workspace
                    </div>
                    <div className="flex items-center justify-center rounded-xl h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 gap-2 cursor-pointer transition-colors">
                      <Plus size={16} /> New Project
                    </div>
                  </div>
                </div>

                {/* Hero Metrics Grid */}
                <div className="grid gap-6 grid-cols-4">
                  {[
                    { icon: BriefcaseBusiness, title: "ACTIVE PROJECTS", value: "9", badge: "OPERATIONAL", badgeColor: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
                    { icon: Users, title: "TEAM MEMBERS", value: "1", badge: "SYNCED", badgeColor: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
                    { icon: Zap, title: "LIFETIME USAGE", value: "0.2 CR", badge: "ALL TIME", badgeColor: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
                    { icon: ShieldCheck, title: "CREDIT BALANCE", value: "249.8017", badge: "PRO", badgeColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" }
                  ].map((card, idx) => (
                    <div key={idx} className="rounded-3xl p-6 relative overflow-hidden bg-[#0F1423] border border-white/[0.03]">
                      {/* Wavy bottom shape */}
                      <svg className="absolute bottom-0 left-0 w-full h-1/2 text-white/[0.03]" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" />
                      </svg>

                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex size-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-blue-500">
                          <card.icon size={18} />
                        </div>
                        <div className={`px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest leading-none block">{card.badge}</span>
                        </div>
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{card.title}</p>
                        <h3 className="text-3xl font-semibold text-white tracking-tight leading-none">{card.value}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Projects Grid */}
                <div className="flex flex-col mt-4">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <BriefcaseBusiness size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Recent Projects</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mt-1">QUICK ACCESS TO YOUR WORKSPACE</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white cursor-pointer transition-colors flex items-center gap-1">
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
                      <div key={i} className="rounded-3xl flex flex-col bg-[#0F1423] border border-white/[0.03] p-6 relative overflow-hidden cursor-pointer hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-8 relative z-10">
                          <div className="size-11 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-center justify-center">
                            <BriefcaseBusiness size={18} className="text-blue-500" />
                          </div>
                        </div>
                        <div className="mb-6 relative z-10">
                          <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{p.name}</h3>
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-white/5 relative z-10 mt-auto">
                          <div className="flex items-center gap-2 text-white/50">
                            <Wallet size={14} className="text-amber-500" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">CREDITS</span>
                          </div>
                          <span className="text-[11px] font-bold text-white tracking-wider">{p.credits} CR</span>
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
