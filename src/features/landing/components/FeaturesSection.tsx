"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { CardSpotlight } from "@/src/components/ui/card-spotlight";
import { Zap, Sparkles, MonitorPlay, MessageSquareText } from "lucide-react";

const WavyLines = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
    <path d="M0 10 Q 12.5 5, 25 10 T 50 10 T 75 10 T 100 10" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
    <path d="M0 15 Q 12.5 10, 25 15 T 50 15 T 75 15 T 100 15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
  </svg>
);

const features = [
  {
    title: "Lightning Fast Sandboxes",
    description: "Launch fully isolated, secure development environments in milliseconds. Zero local setup or configuration required.",
    icon: <Zap size={22} className="text-blue-600" />,
    image: "/Features/sandbox_glass.png"
  },
  {
    title: "Context-Aware AI Generation",
    description: "Import your Figma designs instantly and let our AI build, edit, and refactor production-grade code that perfectly matches your specs.",
    icon: <Sparkles size={22} className="text-blue-600" />,
    image: "/Features/ai_core_glass.png"
  },
  {
    title: "Chat-Driven Iteration",
    description: "Direct the entire development process naturally. Just ask for changes in the chat and watch the interface update in real-time.",
    icon: <MessageSquareText size={22} className="text-blue-600" />,
    image: "/Features/chat_bubbles_glass.png"
  },
  {
    title: "Live Interactive Previews",
    description: "See your changes immediately. Our secure proxy infrastructure ensures your preview is perfectly synced with every agent edit.",
    icon: <MonitorPlay size={22} className="text-blue-600" />,
    image: "/Features/ui_panels_glass.png"
  }
];

export function FeaturesSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const imgRotate = useTransform(scrollYProgress, [0, 1], [-180, 180]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  const imgXRight = useTransform(scrollYProgress, [0, 1], [100, -100]);
  
  const imgY2 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const imgRotate2 = useTransform(scrollYProgress, [0, 1], [180, -180]);
  const imgScale2 = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  const imgXLeft = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <section ref={containerRef} className="bg-transparent py-32 px-5 relative z-10 overflow-visible" id="features">
      {/* Dynamic Glowing Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-50">
        <div className="absolute top-1/4 left-[-10%] w-[50vw] h-[50vw] bg-cyan-300/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-[-10%] w-[60vw] h-[60vw] bg-blue-300/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating 3D Image Parallax - Top Right */}
      <motion.div 
        style={{ y: imgY, x: imgXRight, rotate: imgRotate, scale: imgScale }}
        className="absolute right-0 top-[-5%] translate-x-[15%] md:translate-x-[20%] w-[180px] md:w-[250px] lg:w-[350px] opacity-20 pointer-events-none z-0"
      >
        <Image 
          src="/3D_Element.png" 
          alt="Floating 3D Element Top" 
          fill
          className="object-contain"
          style={{ animation: 'spin 30s linear infinite' }}
          unoptimized
        />
      </motion.div>

      {/* Floating 3D Image Parallax - Bottom Left */}
      <motion.div 
        style={{ y: imgY2, x: imgXLeft, rotate: imgRotate2, scale: imgScale2 }}
        className="absolute left-0 bottom-[-40%] translate-x-[-15%] md:translate-x-[-20%] w-[180px] md:w-[250px] lg:w-[350px] opacity-20 pointer-events-none z-0"
      >
        <Image 
          src="/3D_Element.png" 
          alt="Floating 3D Element Bottom" 
          fill
          className="object-contain"
          style={{ animation: 'spin 40s linear infinite reverse' }}
          unoptimized
        />
      </motion.div>

      <div className="max-w-[1200px] mx-auto flex flex-col items-center relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-md shadow-[0_8px_30px_rgba(59,130,246,0.1)] border border-blue-200/50 mb-6">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Workspace Foundations</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-sm">
            Intelligent features for<br />
            <span className="text-white/80">autonomous development.</span>
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-[1200px]">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ delay: idx * 0.12, duration: 0.8, type: "spring", bounce: 0.3 }}
              className={`will-change-transform ${idx === 0 || idx === 3 ? "md:col-span-2 lg:col-span-2" : "md:col-span-1 lg:col-span-1"}`}
            >
              <CardSpotlight
                radius={400}
                color="rgba(255, 255, 255, 0.4)"
                className="h-full relative rounded-2xl md:rounded-[32px] bg-white/60 backdrop-blur-[40px] border-[1.5px] border-white/80 overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.5)]"
              >
                {/* Background Image Element with Gradient Mask */}
                <div 
                  className={`absolute z-0 pointer-events-none mix-blend-multiply opacity-90 ${
                    idx === 0 || idx === 3 
                      ? "top-0 right-0 h-full w-[60%] md:w-[50%]" 
                      : "bottom-0 left-0 w-full h-[55%]"
                  }`}
                  style={{
                    WebkitMaskImage: idx === 0 || idx === 3 
                      ? "linear-gradient(to right, transparent, black 30%)" 
                      : "linear-gradient(to bottom, transparent, black 40%)",
                    maskImage: idx === 0 || idx === 3 
                      ? "linear-gradient(to right, transparent, black 30%)" 
                      : "linear-gradient(to bottom, transparent, black 40%)"
                  }}
                >
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    fill
                    className={idx === 0 || idx === 3 ? "object-contain object-right" : "object-contain object-bottom"} 
                    unoptimized
                  />
                </div>

                <div className={`p-8 flex h-full relative z-10 ${idx === 0 || idx === 3 ? "flex-col md:flex-row gap-8 w-full md:w-[60%]" : "flex-col"}`}>
                  <div className="flex-1 flex flex-col">
                    {/* Top Label & Waves */}
                    <div>
                      <WavyLines className="w-16 h-4 text-blue-500/20" />
                    </div>

                    {/* Content */}
                    <h3 className={`font-medium text-slate-800 mt-6 mb-4 ${idx === 0 || idx === 3 ? "text-3xl" : "text-2xl"}`}>{feature.title}</h3>
                    <p className={`text-slate-600 leading-relaxed flex-1 ${idx === 0 || idx === 3 ? "text-base mb-6 max-w-[90%]" : "text-sm mb-12"}`}>
                      {feature.description}
                    </p>
                  </div>

                  {/* Bottom Graphic & Icon */}
                  <div className={`flex items-end ${idx === 0 || idx === 3 ? "justify-start items-center md:items-end w-full md:w-auto" : "justify-between mt-auto pt-8"}`}>
                    {idx !== 0 && idx !== 3 && (
                      <WavyLines className="w-32 h-6 text-slate-300/40" />
                    )}
                    <div className={`rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/50 flex items-center justify-center ${idx === 0 || idx === 3 ? "w-16 h-16 shrink-0 mt-4 md:mt-0" : "w-12 h-12"}`}>
                      {feature.icon}
                    </div>
                  </div>
                </div>
              </CardSpotlight>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
