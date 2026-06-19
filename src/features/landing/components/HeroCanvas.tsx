"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProjectedParticle, initParticles, updateProjectedParticles, easeInOutQuad } from "../utils/heroCanvasRenderer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onAction: () => void;
}

export function HeroCanvas({ containerRef, onAction }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const caption2Ref = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  // Effect for Canvas particle animation and scroll progress calculation
  useEffect(() => {
    // 1. Particle data initialization
    const N = window.innerWidth < 768 ? 1000 : 3000;
    const particles = initParticles(N);

    // 2. Set up Canvas and Context
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    let canvasWidth = 0;
    let canvasHeight = 0;
    let cachedGradient: CanvasGradient | null = null; 

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      
      canvas.width = Math.floor(canvasWidth * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);
      ctx.scale(dpr, dpr);
      cachedGradient = null; 
    };

    resizeCanvas();
    
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    };
    window.addEventListener("resize", handleResize);

    const parentElement = canvas.parentElement || canvas;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    parentElement.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("mouseleave", handleMouseLeave);

    const heroElement = containerRef.current;
    if (!heroElement) return;

    const scrollState = { progress: 0, isActive: true };

    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: heroElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollState.progress = self.progress;
      },
      onToggle: (self) => {
        scrollState.isActive = self.isActive;
        if (self.isActive && animationFrameId === 0) {
          lastTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
        }
      },
    });

    let animationFrameId: number = 0;
    let rotationY = 0;
    let rotationX = 0;
    let floatTime = 0;
    let prevP = 0; 
    let frameCount = 0; 
    let lastTime = 0; 

    const projected: ProjectedParticle[] = particles.map((_, i) => ({ x: 0, y: 0, z: 0, size: 0, color: "", opacity: 0, idx: i }));

    const render = (timestamp: number) => {
      if (!scrollState.isActive) {
        animationFrameId = 0;
        return; // Completely freeze the loop to save CPU when offscreen
      }

      const p = scrollState.progress;
      const velocity = Math.abs(p - prevP);
      
      // Dynamic framerate: Drop to ~30 FPS on mobile during active scroll to prevent jank, 60 FPS otherwise
      const isMobile = window.innerWidth < 768;
      const targetFrameMs = (isMobile && velocity > 0.0005) ? 33 : 16;

      if (timestamp - lastTime < targetFrameMs) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastTime = timestamp;
      prevP = p;

      const width = canvasWidth;
      const height = canvasHeight;

      ctx.fillStyle = "#070c1b";
      ctx.fillRect(0, 0, width, height);
      frameCount++;

      let springFactor = 0.35 + Math.min(0.45, velocity * 8);

      if (p > 0.94) {
        const snapT = (p - 0.94) / 0.06; 
        springFactor = springFactor * (1 - snapT) + 1.0 * snapT;
      } else if (p < 0.06) {
        const snapT = (0.06 - p) / 0.06; 
        springFactor = springFactor * (1 - snapT) + 1.0 * snapT;
      }

      const R = Math.min(width, height) * (width < 768 ? 0.28 : 0.22);
      const cx = width / 2;
      const cy = height / 2;

      floatTime += 0.015;
      rotationY += 0.0025;
      rotationX += 0.001;

      if (p > 0.5) {
        let glowOpacity = 0;
        if (p < 0.65) {
          glowOpacity = Math.min(1, (p - 0.5) / 0.15);
        } else {
          glowOpacity = Math.max(0, 1 - (p - 0.65) / 0.35);
        }

        if (glowOpacity > 0) {
          if (!cachedGradient) {
            cachedGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
            cachedGradient.addColorStop(0, `rgba(132, 169, 255, 1)`);
            cachedGradient.addColorStop(0.5, `rgba(180, 150, 255, 0.56)`);
            cachedGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          }

          const easedGlow = easeInOutQuad(glowOpacity);
          ctx.globalAlpha = easedGlow * 0.23;
          ctx.fillStyle = cachedGradient;
          ctx.beginPath();
          ctx.arc(cx, cy, R * 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      updateProjectedParticles(
        particles,
        projected,
        N,
        width,
        height,
        p,
        floatTime,
        rotationY,
        rotationX,
        springFactor,
        mouseRef.current.active,
        mouseRef.current.x,
        mouseRef.current.y
      );

      if (frameCount % 6 === 0) {
        projected.sort((a, b) => b.z - a.z);
      }

      if (mouseRef.current.active) {
        ctx.lineWidth = 0.55;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const maxLineDist = 95;
        const maxLineDistSq = maxLineDist * maxLineDist;
        
        for (let i = 0; i < N; i++) {
          const part = projected[i];
          if (part.opacity <= 0 || part.size <= 0) continue;

          const dx = part.x - mx;
          const dy = part.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxLineDistSq) {
            const dist = Math.sqrt(distSq);
            const lineOpacity = (1 - dist / maxLineDist) * 0.18 * part.opacity;
            ctx.strokeStyle = `rgba(${part.color}, ${lineOpacity})`;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(part.x, part.y);
            ctx.stroke();
          }
        }
      }

      const PI2 = Math.PI * 2;
      for (let i = 0; i < N; i++) {
        const part = projected[i];
        
        if (part.opacity <= 0.01 || part.size <= 0.01 || 
            part.x < -10 || part.x > width + 10 || 
            part.y < -10 || part.y > height + 10) {
          continue;
        }
        
        ctx.fillStyle = `rgba(${part.color}, ${part.opacity})`;
        
        if (part.size < 1.5) {
          const drawSize = Math.max(1.0, part.size * 2);
          ctx.fillRect(part.x - drawSize/2, part.y - drawSize/2, drawSize, drawSize);
        } else {
          ctx.beginPath();
          ctx.arc(part.x, part.y, part.size, 0, PI2);
          ctx.fill();
        }
      }

      if (textRef.current) {
        const textOpacity = Math.max(0, 1 - p * 2.5);
        textRef.current.style.opacity = textOpacity.toString();
        textRef.current.style.transform = `translateY(${p * -50}px)`;
        textRef.current.style.pointerEvents = textOpacity < 0.05 ? "none" : "auto";
      }

      if (captionRef.current) {
        let opacity = 0;
        if (p >= 0.25 && p < 0.45) {
          opacity = (p - 0.25) / 0.2;
        } else if (p >= 0.45 && p < 0.6) {
          opacity = 1;
        } else if (p >= 0.6 && p < 0.72) {
          opacity = 1 - (p - 0.6) / 0.12;
        }
        
        captionRef.current.style.opacity = opacity.toString();
        let caption1Y = 0;
        if (p < 0.6) {
          caption1Y = (1 - opacity) * 20;
        } else {
          caption1Y = -((p - 0.6) / 0.12) * 20;
        }
        captionRef.current.style.transform = `translateY(${caption1Y}px)`;
      }

      if (caption2Ref.current) {
        let opacity = 0;
        if (p >= 0.75 && p < 0.9) {
          opacity = (p - 0.75) / 0.15;
        } else if (p >= 0.9) {
          opacity = 1;
        }
        
        caption2Ref.current.style.opacity = opacity.toString();
        const caption2Y = (1 - opacity) * 20;
        caption2Ref.current.style.transform = `translateY(${caption2Y}px)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      window.removeEventListener("resize", handleResize);
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseleave", handleMouseLeave);
      scrollTriggerInstance.kill();
      cancelAnimationFrame(animationFrameId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* HTML5 Canvas Particle Animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Hero text overlay (Centered both horizontally and vertically - Fades out on scroll) */}
      <div ref={textRef} className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        
        {/* Static white Wyrefy Logo */}
        <div className="select-none pointer-events-none mb-4">
          <Image
            src="/white_wyrefy_logo.png"
            alt="Wyrefy Logo"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
            priority
            unoptimized
          />
        </div>

        {/* Main Title */}
        <h1 className="text-7xl md:text-[120px] font-extrabold tracking-tighter text-white leading-none mb-16">
          Wyrefy
        </h1>

        {/* Static CTA Button (Without animation) */}
        <button
          type="button"
          onClick={onAction}
          className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
        >
          Start Building
        </button>
      </div>

      {/* Scroll Caption overlay (Fades in like a movie credits card inside the rotating particle sphere) */}
      <div 
        ref={captionRef} 
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center w-full max-w-7xl mx-auto px-4 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textShadow: '0 4px 25px rgba(0,0,0,0.85)' }}>
          The autonomous AI workspace that transforms <br className="hidden md:inline" /> your designs into production-ready software.
        </p>
      </div>

      {/* Second Caption overlay (Fades in as particles disperse into 3D landscape) */}
      <div 
        ref={caption2Ref} 
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center w-full max-w-7xl mx-auto px-4 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <span className="text-sm md:text-xl font-bold uppercase tracking-[0.4em] text-white/60 mb-6" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
          A
        </span>
        <Image 
          src="/Selsoftinc.webp" 
          alt="Selsoft Inc Logo" 
          width={400} 
          height={150} 
          className="w-56 md:w-80 object-contain mb-6"
          style={{ filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.8))' }}
          unoptimized
        />
        <span className="text-sm md:text-xl font-bold uppercase tracking-[0.4em] text-white/60" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
          Product
        </span>
      </div>
    </>
  );
}
