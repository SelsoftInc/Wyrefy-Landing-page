"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FolderPlus, UploadCloud, Bot, MonitorPlay } from "lucide-react";
import { LazyMotion, domAnimation, m as motion } from "motion/react";

/* ─────────────── Tech stack data ─────────────── */
const techStack = [
  { name: "Figma",   iconSrc: "/features_icon/figma.svg"   },
  { name: "Next.js", iconSrc: "/features_icon/nextjs.svg"  },
  { name: "React",   iconSrc: "/features_icon/react.svg"   },
  { name: "Angular", iconSrc: "/features_icon/angular.svg" },
  { name: "Vue",     iconSrc: "/features_icon/vue-js.svg"  },
] as const;

/* ─────────────── Step data ─────────────── */
const steps = [
  {
    num: "01", title: "Open a Project",
    desc: "Create or select a project workspace where development begins.",
    icon: <FolderPlus  className="w-5 h-5" />,
    iconBg: "bg-[#00C3FF]/10 text-[#00C3FF] border-[#00C3FF]/30",
    accent: "#00C3FF", glow: "rgba(0,195,255,0.3)",
    imageSrc: "/process/image1.png",
  },
  {
    num: "02", title: "Import Context",
    desc: "Upload designs, requirements, documentation, repositories, and assets.",
    icon: <UploadCloud className="w-5 h-5" />,
    iconBg: "bg-[#A200FF]/10 text-[#A200FF] border-[#A200FF]/30",
    accent: "#A200FF", glow: "rgba(162,0,255,0.3)",
    imageSrc: "/process/image2.png",
  },
  {
    num: "03", title: "Iterate in Chat",
    desc: "Collaborate with AI agents through natural language conversations.",
    icon: <Bot         className="w-5 h-5" />,
    iconBg: "bg-[#FF007F]/10 text-[#FF007F] border-[#FF007F]/30",
    accent: "#FF007F", glow: "rgba(255,0,127,0.3)",
    imageSrc: "/process/image3.png",
  },
  {
    num: "04", title: "Review Live Preview",
    desc: "Instantly inspect and validate the running application without leaving the workspace.",
    icon: <MonitorPlay className="w-5 h-5" />,
    iconBg: "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30",
    accent: "#00E676", glow: "rgba(0,230,118,0.3)",
    imageSrc: "/process/image4.png",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SVG coordinate system  →  viewBox "0 0 1000 680"
   Card half-dims: CW=120 (width), CH=50 (height, inactive)
   EXP = extra height in VB units added when active

   Layout (matches reference):
     01  cx=170  cy=245   ← vertically centered between 02 and 03
     02  cx=530  cy= 90   ← top right
     03  cx=530  cy=400   ← mid right (310 units below 02)
     04  cx=350  cy=720   ← bottom middle (320 units below 03)
───────────────────────────────────────────────────────────────────────────── */

const VB_W = 750;
const VB_H = 800;   // Increased significantly to give all cards vertical breathing room
const CW   = 150;
const CH   = 75;
const EXP  = 130;

// Card centres — spaced to ensure no overlap when fully expanded
const C = [
  { cx: 170, cy: 245 },   // 01 – vertically centered between 02 and 03
  { cx: 530, cy:  90 },   // 02 – top right
  { cx: 530, cy: 400 },   // 03 – mid right     (310 units below 02)
  { cx: 350, cy: 720 },   // 04 – bottom middle (320 units below 03)
];

// Which path is lit for which activeStep
const PATH_ACTIVE_MAP = [
  (a: number) => a === 0 || a === 1, // p0  01→02
  (a: number) => a === 0 || a === 2, // p1  01→03
  (a: number) => a === 1 || a === 2, // p2  02→03 loop
  (a: number) => a === 2 || a === 3, // p3  03→04
];

// Gradient colour pairs per path
const PATH_GRAD = [
  ["#00C3FF", "#A200FF"],   // p0 cyan→purple
  ["#00C3FF", "#FF007F"],   // p1 cyan→pink
  ["#A200FF", "#FF007F"],   // p2 purple loop to pink
  ["#FF007F", "#00E676"],   // p3 pink→green
];

function buildPaths(active: number) {
  // bottom y of card 03 – moves down when it's active
  const c3bot = C[2].cy + CH + (active === 2 ? EXP : 0);

  // Connection coordinates (y shifts down by EXP/2 when active to stay vertically centered)
  const o1r  = { x: C[0].cx + CW, y: C[0].cy + (active === 0 ? EXP / 2 : 0) };   // 01 right
  const o2l  = { x: C[1].cx - CW, y: C[1].cy + (active === 1 ? EXP / 2 : 0) };   // 02 left
  const o2r  = { x: C[1].cx + CW, y: C[1].cy + (active === 1 ? EXP / 2 : 0) };   // 02 right
  const o3l  = { x: C[2].cx - CW, y: C[2].cy + (active === 2 ? EXP / 2 : 0) };   // 03 left
  const o3r  = { x: C[2].cx + CW, y: C[2].cy + (active === 2 ? EXP / 2 : 0) };   // 03 right
  const o3b  = { x: C[2].cx,      y: c3bot    };   // 03 bottom (dynamic)
  const o4t  = { x: C[3].cx,      y: C[3].cy - CH };// 04 top (top edge never shifts)

  const p0 = `M ${o1r.x} ${o1r.y} C ${o1r.x+60} ${o1r.y}, ${o2l.x-60} ${o2l.y}, ${o2l.x} ${o2l.y}`;
  const p1 = `M ${o1r.x} ${o1r.y} C ${o1r.x+60} ${o1r.y}, ${o3l.x-60} ${o3l.y}, ${o3l.x} ${o3l.y}`;
  const p2 = `M ${o2r.x} ${o2r.y} C ${o2r.x+60} ${o2r.y}, ${o3r.x+60} ${o3r.y}, ${o3r.x} ${o3r.y}`;
  const dy3 = Math.min(80, Math.max(20, (o4t.y - o3b.y) / 2));
  const p3 = `M ${o3b.x} ${o3b.y} C ${o3b.x} ${o3b.y+dy3}, ${o4t.x} ${o4t.y-dy3}, ${o4t.x} ${o4t.y}`;

  // All anchor dots (start + end of each path)
  const anchors = [
    o1r, o2l,   // p0
    o1r, o3l,   // p1  (o1r duplicates – both draw at same spot, looks like one dot)
    o2r, o3r,   // p2
    o3b, o4t,   // p3
  ];

  return { paths: [p0, p1, p2, p3], anchors };
}

/* ─────────────── Card component ─────────────── */
function FlowCard({
  step, cidx, active, onEnter, onLeave, delay,
}: {
  step: typeof steps[number]; cidx: number;
  active: boolean; onEnter(): void; onLeave(): void; delay: number;
}) {
  const pos    = C[cidx];
  const cardH  = CH * 2 + (active ? EXP : 0);
  const leftPct = ((pos.cx - CW)  / VB_W) * 100;
  const topPct  = ((pos.cy - CH)  / VB_H) * 100;
  const wPct    = ( CW * 2        / VB_W) * 100;
  const hPct    = ( cardH         / VB_H) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, type: "spring", bounce: 0.28 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute z-10 cursor-pointer flex flex-col"
      style={{
        left:   `${leftPct}%`,
        top:    `${topPct}%`,
        width:  `${wPct}%`,
        height: `${hPct}%`,
      }}
    >
      <div
        className="w-full flex-1 rounded-2xl border bg-gradient-to-br from-[#FAF9FD] to-[#F1EEFC]/30 p-3 xl:p-4 flex flex-col gap-1.5 xl:gap-2 overflow-hidden"
        style={{
          borderColor: active ? step.accent : "#CBD5E1",
          boxShadow:   active
            ? `0 0 0 1px ${step.accent}, 0 14px 40px ${step.glow}`
            : "0 2px 12px rgba(0,0,0,0.06)",
          transition: "border-color 0.35s, box-shadow 0.35s",
        }}
      >
        {/* Icon + step number */}
        <div className="flex items-center justify-between shrink-0">
          <div className={`w-7 h-7 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center shrink-0 ${step.iconBg}`}>
            {React.cloneElement(step.icon, { className: "w-4 h-4 xl:w-5 xl:h-5" })}
          </div>
          <span
            className="text-[10px] font-black tracking-widest"
            style={{ color: active ? step.accent : "#94A3B8", transition: "color 0.3s" }}
          >
            {step.num}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[11px] xl:text-[13px] font-extrabold text-slate-900 leading-snug tracking-tight shrink-0 mt-0.5 xl:mt-1">
          {step.title}
        </h3>

        {/* Description – fades in when active, height expands in sync */}
        <div
          className="grid transition-all"
          style={{
            opacity: active ? 1 : 0,
            gridTemplateRows: active ? "1fr" : "0fr",
            transitionDuration: "0.4s",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p className="text-[10px] xl:text-[11px] font-semibold text-slate-500 leading-relaxed overflow-hidden">
            {step.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────── Main component ─────────────── */
export function UseCasesSection() {
  const [activeStep,  setActiveStep]  = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setActiveStep(p => (p + 1) % 4), 2500);
  };

  /* Auto-cycle */
  useEffect(() => {
    intervalRef.current = setInterval(() => setActiveStep(p => (p + 1) % 4), 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* Rebuild paths every render so p3 stays attached when card 03 expands */
  const { paths, anchors } = buildPaths(activeStep);
  const pathActive = PATH_ACTIVE_MAP.map(fn => fn(activeStep));

  return (
    <LazyMotion features={domAnimation}>
    <>
      <style>{`
        @keyframes dash-flow {
          from { stroke-dashoffset: 20; }
          to   { stroke-dashoffset:  0; }
        }
        .dash-active   { animation: dash-flow 1.0s linear infinite; }
        .dash-inactive { animation: dash-flow 3.2s linear infinite; }
      `}</style>

      {/* ── Tech Stack (Fixed Grid) ── */}
      <div className="w-full bg-[#0A0A0C] py-20 border-b border-white/5 flex flex-col items-center select-none">
        <span className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-500/80 text-center mb-12 px-6">
          Works with your favorite technologies
        </span>
        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center w-full">
            {techStack.map((tech, idx) => (
              <div key={`${tech.name}-${idx}`} className="flex items-center gap-3 shrink-0 hover:scale-110 transition-transform duration-300 select-none">
                <Image src={tech.iconSrc} alt={tech.name} width={40} height={40}
                  className={`w-8 h-8 md:w-10 md:h-10 object-contain pointer-events-none ${tech.name === "Next.js" ? "invert" : ""}`}
                  unoptimized />
                <span className="text-lg md:text-2xl font-extrabold text-white tracking-wide pointer-events-none">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="relative w-full px-4 sm:px-6 py-28 bg-white text-slate-800 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:24px_24px]" id="use-cases">
        <div className="w-full max-w-6xl mx-auto relative z-10">

          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6836E1]">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mt-6">
              From context to preview,<br />
              <span className="text-slate-400">without leaving the workspace.</span>
            </h2>
          </div>

          {/* ── Desktop Grid: Left Flowchart, Right Image ── */}
          <div className="hidden lg:grid grid-cols-[1fr_1.1fr] gap-8 xl:gap-16 items-start">
            
            {/* LEFT: Flowchart */}
            <div
              className="relative w-full select-none sticky top-24"
              style={{ paddingBottom: `${(VB_H / VB_W) * 100}%` }}
            >
              {/* SVG layer */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="none"
                overflow="visible"
              >
                <defs>
                  <filter id="glow2" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  {PATH_GRAD.map(([c1, c2], i) => (
                    <linearGradient key={i} id={`pg2-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor={c1}/>
                      <stop offset="100%" stopColor={c2}/>
                    </linearGradient>
                  ))}
                </defs>

                {/* Draw all 4 paths */}
                {paths.map((d, i) => (
                  <g key={i}>
                    {/* Ghost track */}
                    <path d={d} stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6 5" fill="none"/>
                    {/* Animated coloured line */}
                    <path
                      d={d}
                      stroke={`url(#pg2-${i})`}
                      strokeWidth={pathActive[i] ? 3 : 1.5}
                      strokeDasharray={pathActive[i] ? "8 5" : "4 6"}
                      strokeLinecap="round" fill="none"
                      filter={pathActive[i] ? "url(#glow2)" : "none"}
                      className={`transition-all duration-500 ${pathActive[i] ? "dash-active" : "dash-inactive"}`}
                      style={{ opacity: pathActive[i] ? 1 : 0.35 }}
                    />
                  </g>
                ))}

                {/* Anchor dots */}
                {anchors.map((dot, di) => {
                  const pi     = Math.floor(di / 2);
                  const active = pathActive[pi];
                  const col    = PATH_GRAD[pi][di % 2 === 0 ? 0 : 1];
                  return (
                    <circle key={di} cx={dot.x} cy={dot.y} r={active ? 5.5 : 4}
                      fill="white" stroke={active ? col : "#CBD5E1"} strokeWidth="2"
                      className="transition-all duration-500"
                      style={{ filter: active ? `drop-shadow(0 0 4px ${col})` : "none" }}
                    />
                  );
                })}
              </svg>

              {/* Cards */}
              {steps.map((step, idx) => (
                <FlowCard
                  key={step.num} step={step} cidx={idx}
                  active={activeStep === idx}
                  onEnter={() => {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setActiveStep(idx);
                  }}
                  onLeave={() => {
                    startInterval();
                  }}
                  delay={idx * 0.1}
                />
              ))}
            </div>

            {/* RIGHT: Image Preview Panel (Slider) */}
            <div className="sticky top-24 pt-12">
              <div 
                className="w-full rounded-[2rem] overflow-hidden shadow-2xl border-2 bg-white relative transition-all duration-500"
                style={{ 
                  borderColor: steps[activeStep].accent, 
                  boxShadow: `0 24px 60px ${steps[activeStep].glow}` 
                }}
              >
                {/* Browser chrome bar */}
                <div
                  className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 transition-colors duration-500"
                  style={{ background: `${steps[activeStep].accent}0d` }}
                >
                  <span className="w-3 h-3 rounded-full bg-red-400/80 shrink-0" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/80 shrink-0" />
                  <span className="w-3 h-3 rounded-full bg-green-400/80 shrink-0" />
                  
                  {/* Sliding URL Bar */}
                  <div className="flex-1 mx-4 h-6 rounded-full bg-slate-100 flex items-center px-3 gap-2 overflow-hidden">
                    <span className="w-2 h-2 rounded-full shrink-0 transition-colors duration-500" style={{ background: steps[activeStep].accent }} />
                    <div 
                      className="flex flex-col transition-transform duration-500" 
                      style={{ transform: `translateY(-${activeStep * 25}%)` }}
                    >
                      {steps.map((s) => (
                        <span key={s.num} className="text-[10px] text-slate-400 font-mono truncate h-6 flex items-center max-w-[200px] xl:max-w-[300px]">
                          wyrefy.io · {s.num} {s.title}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors duration-500 ${steps[activeStep].iconBg}`}>
                    STEP {steps[activeStep].num}
                  </div>
                </div>

                {/* Sliding Image Track */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <motion.div 
                    className="flex w-[400%] h-full"
                    animate={{ x: `-${activeStep * 25}%` }}
                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                  >
                    {steps.map((step) => (
                      <div key={step.num} className="relative w-1/4 h-full">
                        <Image
                          src={step.imageSrc}
                          alt={step.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-top"
                          unoptimized
                        />
                      </div>
                    ))}
                  </motion.div>
                  {/* Bottom fade overlay (static on top) */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
            
          </div>

          {/* ── Mobile Stack ── */}
          <div className="flex lg:hidden flex-col gap-5 mt-4 max-w-md mx-auto w-full">
            {steps.map((step, idx) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="w-full rounded-2xl bg-gradient-to-br from-[#FAF9FD] to-[#F1EEFC]/30 border border-slate-200 p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.iconBg}`}>{step.icon}</div>
                  <div>
                    <span className="block text-[10px] font-black tracking-wider text-slate-400">{step.num}</span>
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{step.title}</h3>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </>
    </LazyMotion>
  );
}
