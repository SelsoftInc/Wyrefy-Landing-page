"use client";

import { motion, MotionValue, useTransform } from "motion/react";
import { ProcessStep } from "./processData";

export interface ProcessTimelineProps {
  scrollYProgress: MotionValue<number>;
  steps: ProcessStep[];
}

export function ProcessTimeline({ scrollYProgress, steps }: ProcessTimelineProps) {
  // Scale the fill from 0 to 1 based on scroll progress
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="process-timeline-container">
      <div className="process-timeline-track">
        <motion.div 
          className="process-timeline-fill"
          style={{ height: "100%", scaleY }}
        />
        {steps.map((step, index) => {
          // Position each dot evenly along the track
          const topPercent = steps.length > 1 ? (index / (steps.length - 1)) * 100 : 0;
          
          return (
            <div 
              key={step.id} 
              className="process-timeline-node" 
              style={{ top: `${topPercent}%` }}
            >
              <div className="process-timeline-dot" />
              <div className="process-timeline-num">{step.number}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
