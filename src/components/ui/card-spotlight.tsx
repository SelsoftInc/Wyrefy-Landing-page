"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import React, { useRef } from "react";

export function CardSpotlight({
  children,
  className,
  radius = 350,
  color = "rgba(59, 130, 246, 0.15)",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  radius?: number;
  color?: string;
}>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rectRef = useRef<DOMRect | null>(null);
  const lastScrollTop = useRef(0);
  const lastScrollLeft = useRef(0);
  const lastMeasureTime = useRef(0);

  function handleMouseMove(event: React.PointerEvent<HTMLDivElement>) {
    const currentTarget = event.currentTarget;
    const now = performance.now();
    const scrollEl = currentTarget.closest("#main-scroll-container") || document.documentElement;
    const currentScrollTop = scrollEl ? scrollEl.scrollTop : 0;
    const currentScrollLeft = scrollEl ? scrollEl.scrollLeft : 0;

    if (
      !rectRef.current || 
      (
        (currentScrollTop !== lastScrollTop.current || currentScrollLeft !== lastScrollLeft.current) && 
        now - lastMeasureTime.current > 100
      )
    ) {
      rectRef.current = currentTarget.getBoundingClientRect();
      lastScrollTop.current = currentScrollTop;
      lastScrollLeft.current = currentScrollLeft;
      lastMeasureTime.current = now;
    }

    const rect = rectRef.current;
    if (rect) {
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    }
  }

  function handleMouseEnter(event: React.PointerEvent<HTMLDivElement>) {
    rectRef.current = event.currentTarget.getBoundingClientRect();
    const scrollEl = event.currentTarget.closest("#main-scroll-container") || document.documentElement;
    lastScrollTop.current = scrollEl ? scrollEl.scrollTop : 0;
    lastScrollLeft.current = scrollEl ? scrollEl.scrollLeft : 0;
    lastMeasureTime.current = performance.now();
  }

  function handleMouseLeave() {
    rectRef.current = null;
  }

  return (
    <div
      className={`group relative overflow-hidden ${className}`}
      onPointerMove={handleMouseMove}
      onPointerEnter={handleMouseEnter}
      onPointerLeave={handleMouseLeave}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              ${color},
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
}
