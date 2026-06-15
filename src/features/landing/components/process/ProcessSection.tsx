"use client";

import { motion } from "motion/react";
import { processData } from "./processData";

export function ProcessSection() {
  return (
    <section className="relative w-full py-32 bg-white text-slate-800" id="process">
      <div className="w-full flex flex-col items-center justify-center px-5 md:px-10 overflow-hidden">
        
        {/* Header Content */}
        <div className="text-center mb-24 w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6"
          >
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">How It Works</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-slate-900"
          >
            From context to preview,<br />
            <span className="text-slate-400">without leaving the workspace.</span>
          </motion.h2>
        </div>

        {/* Zigzag Content Layout */}
        <div className="flex flex-col w-full max-w-[1400px] mx-auto gap-32">
          {processData.map((step, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <div 
                key={step.id} 
                className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24 w-full`}
              >
                {/* Text Content */}
                <motion.div 
                  initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                  className="flex-1 w-full"
                >
                  <div className="text-blue-600 text-xl font-bold tracking-widest mb-4 font-mono">{step.number}</div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 text-slate-800">{step.title}</h3>
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed">{step.description}</p>
                </motion.div>

                {/* Visual */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2, type: "spring", bounce: 0.3 }}
                  className="flex-[1.5] w-full [perspective:1200px]"
                >
                  <motion.div
                    initial={{ 
                      rotateX: 0, 
                      rotateY: isReversed ? 12 : -12 
                    }}
                    whileInView={{ 
                      rotateX: 0, 
                      rotateY: isReversed ? 12 : -12 
                    }}
                    whileHover={{ 
                      rotateX: 0, 
                      rotateY: 0, 
                      scale: 1.05,
                      y: -10
                    }}
                    viewport={{ once: false }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group w-full aspect-square md:aspect-[16/10] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(59,130,246,0.05)] hover:shadow-[0_40px_80px_rgba(59,130,246,0.1)] border border-slate-200/80 bg-slate-50 relative p-2 md:p-6 cursor-pointer"
                    style={{ WebkitBoxReflect: "below 0px linear-gradient(to bottom, transparent 70%, rgba(255,255,255,0.15))" }}
                  >
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-100 bg-white/[0.02]">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-100/10 to-transparent z-10 pointer-events-none"></div>
                      {step.visual}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
