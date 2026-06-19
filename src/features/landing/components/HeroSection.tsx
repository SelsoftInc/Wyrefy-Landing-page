"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "motion/react";
import { Navbar } from "./Navbar";
import { HeroCanvas } from "./HeroCanvas";

export function HeroSection({ onAction }: { onAction: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const cardScaleX = useTransform(scrollYProgress, [0, 0.45], [0.92, 1]);
  const cardScaleY = useTransform(scrollYProgress, [0, 0.45], [0.78, 1]);
  const invScaleX = useTransform(scrollYProgress, [0, 0.45], [1/0.92, 1]);
  const invScaleY = useTransform(scrollYProgress, [0, 0.45], [1/0.78, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.45], ["40px", "0px"]);
  const cardBorderOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const navbarY = useTransform(scrollYProgress, [0, 0.35], [0, -100]);
  const navbarOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <section ref={containerRef} className="relative w-full select-none h-[300vh] bg-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center bg-white">
        <motion.div 
          style={{ y: navbarY, opacity: navbarOpacity }}
          className="absolute top-0 left-0 w-full z-30"
        >
          <Navbar />
        </motion.div>

        <div className="w-full h-full flex items-center justify-center relative z-20">
          <motion.div 
            style={{ 
              scaleX: cardScaleX,
              scaleY: cardScaleY,
              borderRadius: borderRadius,
              borderColor: `rgba(30, 41, 59, ${cardBorderOpacity})`,
            }}
            className="relative w-full h-full bg-[#070c1b] border overflow-hidden shadow-[0_25px_70px_-10px_rgba(0,0,0,0.7)] will-change-transform"
          >
            <motion.div 
              style={{ scaleX: invScaleX, scaleY: invScaleY }}
              className="absolute inset-0 w-full h-full origin-center will-change-transform"
            >
              <HeroCanvas containerRef={containerRef} onAction={onAction} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
