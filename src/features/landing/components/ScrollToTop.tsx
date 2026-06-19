"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUp } from "lucide-react";

const scrollToTop = () => {
  const startY = window.scrollY;
  const duration = 800; // ms
  const startTime = performance.now();

  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeProgress = easeInOutCubic(progress);
    
    window.scrollTo(0, startY * (1 - easeProgress));

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Use IntersectionObserver instead of scroll listener — zero scroll overhead
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel (at top of page) is NOT visible, show the button
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Invisible sentinel element placed 300px from top */}
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="absolute top-[300px] left-0 w-px h-px pointer-events-none"
      />
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-full border border-white/80 bg-white/90 text-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-white hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(14,165,233,0.6),0_0_60px_rgba(2,132,199,0.4)] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-slate-300 ${
          isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ArrowUp size={20} />
      </button>
    </>
  );
}
