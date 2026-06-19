"use client";

import { LazyMotion, domAnimation, m as motion } from "motion/react";
import { useState, useEffect } from "react";
import { Zap, BrainCircuit, MessageSquare, MonitorPlay } from "lucide-react";
import { BrandLogo } from "@/src/components/ui/brand-logo";

const FEATURES = [
  {
    id: 1,
    title: "Lightning Fast Sandboxes",
    badge: "Instant Setup",
    description: "Launch fully isolated, secure development environments in milliseconds. Zero local setup or configuration required.",
    icon: Zap,
    color: "from-blue-500 to-cyan-400",
    shadow: "shadow-cyan-500/50",
    textColor: "text-blue-500",
  },
  {
    id: 2,
    title: "Context-Aware AI Generation",
    badge: "Figma Integrated",
    description: "Import your Figma designs instantly and let our AI build, edit, and refactor production-grade code that perfectly matches your specs.",
    icon: BrainCircuit,
    color: "from-purple-500 to-fuchsia-500",
    shadow: "shadow-fuchsia-500/50",
    textColor: "text-purple-500",
  },
  {
    id: 3,
    title: "Chat-Driven Iteration",
    badge: "Chat Operations",
    description: "Direct the entire development process naturally. Just ask for changes in the chat and watch the interface update in real-time.",
    icon: MessageSquare,
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-teal-500/50",
    textColor: "text-emerald-500",
  },
  {
    id: 4,
    title: "Live Interactive Previews",
    badge: "Secure Proxy",
    description: "See your changes immediately. Our secure proxy infrastructure ensures your preview is perfectly synced with every agent edit.",
    icon: MonitorPlay,
    color: "from-orange-400 to-rose-500",
    shadow: "shadow-rose-500/50",
    textColor: "text-orange-500",
  }
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Auto-cycle through features if not hovering
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <LazyMotion features={domAnimation}>
    <section className="w-full px-6 pt-16 pb-16 bg-slate-50 text-slate-800 overflow-hidden relative" id="features">
      
      {/* Background atmospheric glow */}
      <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1400px] mx-auto relative z-10">
        
        {/* Header grid matching the original content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12 md:mb-16">
          <div className="flex flex-col items-start">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
              What is Wyrefy?
            </h2>
            <a
              href="#pricing"
              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm cursor-pointer no-underline"
            >
              Explore now
            </a>
          </div>

          <div className="flex justify-end md:pl-12">
            <p className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed max-w-lg">
              Wyrefy is an autonomous AI workspace that turns Figma designs and project context into live, production-grade applications with zero local configuration.
            </p>
          </div>
        </div>

        {/* Layout Grid: Solar System (Left) & HUD Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* LEFT: Solar System */}
          <div 
            className="relative w-full aspect-square md:aspect-[4/3] max-w-[400px] md:max-w-[600px] mx-auto flex items-center justify-center perspective-[1200px] @container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Center Core: Wyrefy Engine (Flat, facing user) */}
            <div className="absolute z-30 flex flex-col items-center justify-center pointer-events-none">
              <BrandLogo className="w-20 h-20 md:w-32 md:h-32 text-blue-600 drop-shadow-xl" />
            </div>

            {/* 3D Tilted Orbital System */}
            <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ transform: "rotateX(70deg)", transformStyle: "preserve-3d" }}>
              <motion.div 
                className="relative w-full h-full"
                animate={{ rotateZ: 360 }}
                transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                style={{ animationPlayState: isHovered ? 'paused' : 'running', transformStyle: "preserve-3d" }}
              >
                {FEATURES.map((feature, idx) => {
                  const angle = (idx * 360) / FEATURES.length;
                  const radiusPercent = 38; // 38% of container width
                  const angleInRads = (angle * Math.PI) / 180;
                  const x = radiusPercent * Math.sin(angleInRads);
                  const y = -radiusPercent * Math.cos(angleInRads);
                  
                  return (
                    <div 
                      key={feature.id}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        transform: `translate(-50%, -50%) translate(calc(${x} * 1cqw), calc(${y} * 1cqw))`,
                        transformStyle: "preserve-3d"
                      }}
                    >
                      {/* Counter-rotation matches exact speed to keep the planet strictly upright along Z axis */}
                      <motion.div
                        animate={{ rotateZ: -360 }}
                        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                        style={{ animationPlayState: isHovered ? 'paused' : 'running', transformStyle: "preserve-3d" }}
                      >
                        {/* Reverse the 70deg X tilt so the card stands completely straight facing the user */}
                        <div style={{ transform: "rotateX(-70deg)" }}>
                          {/* Interactive Planet Node */}
                          <button
                            type="button"
                            aria-label={`Select ${feature.title}`}
                            onMouseEnter={() => setActiveFeature(idx)}
                            className={`relative group flex flex-col items-center justify-center p-2 md:p-4 transition-transform duration-300 ${
                              activeFeature === idx ? 'scale-125' : 'scale-100 hover:scale-110'
                            }`}
                          >
                            <feature.icon className={`w-7 h-7 md:w-10 md:h-10 relative z-10 transition-colors duration-300 ${activeFeature === idx ? feature.textColor : 'text-slate-400 group-hover:text-slate-800'}`} />
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                
                {/* Decorative Orbit Ring */}
                <div className="absolute top-1/2 left-1/2 w-[76cqw] h-[76cqw] rounded-full border-2 border-blue-500/80 border-dashed pointer-events-none" style={{ transform: "translate(-50%, -50%)" }} />
              </motion.div>
            </div>

          </div>

          {/* RIGHT: Dynamic Active Details HUD */}
          <div className="flex flex-col justify-center relative md:pl-12 mt-10 lg:mt-0">
            <div className="relative h-[300px] w-full">
              {FEATURES.map((feature, idx) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: activeFeature === idx ? 1 : 0, 
                    x: activeFeature === idx ? 0 : -20,
                    pointerEvents: activeFeature === idx ? 'auto' : 'none'
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white w-max mb-6 shadow-sm`}>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} ${feature.shadow}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {feature.badge}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-base md:text-xl font-medium text-slate-500 leading-relaxed max-w-xl">
                    {feature.description}
                  </p>

                </motion.div>
              ))}
            </div>

            {/* Pagination / HUD Nav Tracker */}
            <div className="mt-12 flex gap-4">
              {FEATURES.map((feature, i) => (
                <button 
                  key={feature.id} 
                  type="button"
                  aria-label={`Go to feature ${i + 1}`}
                  onClick={() => setActiveFeature(i)}
                  className={`h-[4px] rounded-full overflow-hidden cursor-pointer transition-all duration-500 ease-out ${activeFeature === i ? 'w-16 bg-slate-300' : 'w-8 bg-slate-200 hover:bg-slate-300'}`}
                >
                  {activeFeature === i && (
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: isHovered ? '100%' : '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: isHovered ? 0 : 4, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
    </LazyMotion>
  );
}
