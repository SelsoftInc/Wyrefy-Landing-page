"use client";

import { motion } from "motion/react";
import { processData } from "./processData";

export function ProcessSection() {
  return (
    <section className="relative w-full py-32 bg-transparent text-slate-800" id="process">
      <div className="w-full flex flex-col items-center justify-center px-5 md:px-10 overflow-hidden">
        
        {/* Header Content */}
        <div className="text-center mb-24 w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-md shadow-[0_8px_30px_rgba(59,130,246,0.1)] border border-blue-200/50 mb-6"
          >
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">How It Works</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-sm"
          >
            From context to preview,<br />
            <span className="text-white/80 drop-shadow-sm">without leaving the workspace.</span>
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
                  <div className="text-white text-xl font-bold tracking-widest mb-4 font-mono">{step.number}</div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 text-white drop-shadow-sm">{step.title}</h3>
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed drop-shadow-sm">{step.description}</p>
                </motion.div>

                {/* Visual */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2, type: "spring", bounce: 0.3 }}
                  className="flex-[1.5] w-full"
                >
                  <motion.div
                    className="group w-full aspect-square md:aspect-[16/10] rounded-3xl overflow-hidden bg-white/40 backdrop-blur-[40px] border-[1.5px] border-white/80 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.5)] relative p-2 md:p-6"
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
