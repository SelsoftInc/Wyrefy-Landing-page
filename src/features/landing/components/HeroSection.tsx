"use client";


import Image from "next/image";
import { Navbar } from "./Navbar";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface Particle {
  xPct: number;
  yPct: number;
  xSphere: number;
  ySphere: number;
  zSphere: number;
  xLandNorm: number;
  zLandNorm: number;
  color: string;
  starSize: number;
  starOpacity: number;
  floatSpeedX: number;
  floatSpeedY: number;
  floatPhaseX: number;
  floatPhaseY: number;
  floatAmp: number;
  xCur?: number;
  yCur?: number;
}

export function HeroSection({ onAction }: { onAction: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const caption2Ref = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  
  // We track the scroll position of the entire section container
  // "start start" means the top of the section hits the top of the viewport
  // "end end" means the bottom of the section hits the bottom of the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Card dimensions and styles animate dynamically as you scroll from 0 to 45% of the sticky scroll range
  const cardWidth = useTransform(scrollYProgress, [0, 0.45], ["92vw", "100vw"]);
  const cardMaxWidth = useTransform(scrollYProgress, [0, 0.45], ["1400px", "100%"]);
  const cardHeight = useTransform(scrollYProgress, [0, 0.45], ["80vh", "100vh"]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.45], ["40px", "0px"]);
  const borderWidth = useTransform(scrollYProgress, [0, 0.45], ["1px", "0px"]);
  
  // Navbar translates and fades out during the expansion phase (0 to 35% of the scroll range)
  const navbarY = useTransform(scrollYProgress, [0, 0.35], [0, -100]);
  const navbarOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  // Effect for Canvas particle animation and scroll progress calculation
  useEffect(() => {
    // 1. Particle data initialization (~7500 particles for high density)
    const particles: Particle[] = [];
    const N = 7500;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const goldenAngle = 2 * Math.PI * (1 - 1 / goldenRatio);
    
    // Grid columns and rows for 3D landscape layout
    const cols = Math.floor(Math.sqrt(N)); // ~86
    const maxRow = Math.ceil(N / cols) - 1;

    for (let i = 0; i < N; i++) {
      const ySphere = 1 - (i / (N - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - ySphere * ySphere);
      const theta = i * goldenAngle;
      
      const xSphere = Math.cos(theta) * radiusAtY;
      const zSphere = Math.sin(theta) * radiusAtY;

      const col = i % cols;
      const row = Math.floor(i / cols);
      const xLandNorm = (col / (cols - 1)) * 2 - 1;
      const zLandNorm = (row / maxRow) * 2 - 1;
      
      const rand = Math.random();
      let color = "215, 235, 255"; // bright white-blue
      if (rand < 0.45) {
        color = "65, 105, 255"; // vibrant royal neon blue
      } else if (rand < 0.8) {
        color = "115, 185, 255"; // neon cyan/ice blue
      } else {
        color = "20, 60, 220"; // deep indigo blue
      }

      particles.push({
        xPct: Math.random(),
        yPct: Math.random(),
        xSphere,
        ySphere,
        zSphere,
        xLandNorm,
        zLandNorm,
        color,
        starSize: 0.15 + Math.random() * 0.45, // tiny particle size
        starOpacity: 0.3 + Math.random() * 0.6,
        floatSpeedX: 0.15 + Math.random() * 0.4,
        floatSpeedY: 0.15 + Math.random() * 0.4,
        floatPhaseX: Math.random() * Math.PI * 2,
        floatPhaseY: Math.random() * Math.PI * 2,
        floatAmp: 4 + Math.random() * 12, // organic floating amplitude
      });
    }

    // 2. Set up Canvas and Context
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high density displays and coordinate scaling
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse interaction tracking on parent container (so canvas pointer-events-none doesn't block it)
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

    // 3. Scroll Progress using IntersectionObserver + window.scroll
    const heroElement = containerRef.current;
    if (!heroElement) return;

    let isVisible = false;
    let offsetTop = 0;
    let offsetHeight = 0;

    const updateMetrics = () => {
      const rect = heroElement.getBoundingClientRect();
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      offsetTop = rect.top + scrolled;
      offsetHeight = rect.height;
    };

    updateMetrics();

    const handleScroll = () => {
      if (!isVisible) return;
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const duration = offsetHeight - window.innerHeight;
      if (duration <= 0) return;
      
      let progress = (scrolled - offsetTop) / duration;
      progress = Math.max(0, Math.min(1, progress));
      scrollProgressRef.current = progress;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          updateMetrics();
          window.addEventListener("scroll", handleScroll, { passive: true });
          handleScroll();
        } else {
          window.removeEventListener("scroll", handleScroll);
        }
      },
      { threshold: 0 }
    );

    observer.observe(heroElement);

    // 4. Render loop using requestAnimationFrame
    let animationFrameId: number;
    let rotationY = 0;
    let rotationX = 0;
    let floatTime = 0;
    let prevP = 0; // Track scroll progress of previous frame to calculate velocity

    const easeInOutQuad = (x: number) => {
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    };

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const clientWidth = canvas.clientWidth;
      const clientHeight = canvas.clientHeight;

      // Dynamically adjust internal canvas resolution as parent container expands/shrinks on scroll
      if (canvas.width !== clientWidth * dpr || canvas.height !== clientHeight * dpr) {
        canvas.width = clientWidth * dpr;
        canvas.height = clientHeight * dpr;
        ctx.scale(dpr, dpr);
      }

      const width = clientWidth;
      const height = clientHeight;

      ctx.clearRect(0, 0, width, height);

      const p = scrollProgressRef.current;

      // Calculate scroll velocity (difference in progress per frame) and scale spring rate
      const velocity = Math.abs(p - prevP);
      prevP = p;

      let springFactor = 0.085 + Math.min(0.55, velocity * 12);

      // Snap quickly when approaching scroll boundaries to ensure particles settle before unpinning
      if (p > 0.94) {
        const snapT = (p - 0.94) / 0.06; // 0 to 1
        springFactor = springFactor * (1 - snapT) + 1.0 * snapT;
      } else if (p < 0.06) {
        const snapT = (0.06 - p) / 0.06; // 0 to 1
        springFactor = springFactor * (1 - snapT) + 1.0 * snapT;
      }

      // Base parameters for the Fibonacci sphere
      const R = Math.min(width, height) * (width < 768 ? 0.28 : 0.22);
      const cx = width / 2;
      const cy = height / 2;

      // Increment floating time and rotate sphere slowly over time
      floatTime += 0.015;
      rotationY += 0.0025;
      rotationX += 0.001;

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      const D = 400; // perspective depth constant

      // Draw soft radial purple/blue atmospheric glow around the sphere (fades in as sphere forms, out as it disperses)
      if (p > 0.5) {
        let glowOpacity = 0;
        if (p < 0.65) {
          glowOpacity = Math.min(1, (p - 0.5) / 0.15);
        } else {
          glowOpacity = Math.max(0, 1 - (p - 0.65) / 0.35);
        }

        if (glowOpacity > 0) {
          const easedGlow = easeInOutQuad(glowOpacity);
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
          grad.addColorStop(0, `rgba(132, 169, 255, ${0.23 * easedGlow})`);
          grad.addColorStop(0.5, `rgba(180, 150, 255, ${0.13 * easedGlow})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, R * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Map and project particles
      const projectedParticles = particles.map((part) => {
        // --- 1. Starfield Target coordinates ---
        const floatX = Math.sin(floatTime * part.floatSpeedX + part.floatPhaseX) * part.floatAmp;
        const floatY = Math.cos(floatTime * part.floatSpeedY + part.floatPhaseY) * part.floatAmp;
        const sxStar = part.xPct * width + floatX;
        const syStar = part.yPct * height + floatY;
        const szStar = 0;
        const sizeStar = part.starSize;
        const opacityStar = part.starOpacity;

        // --- 2. Sphere Target coordinates ---
        const xSphereRot = part.xSphere * cosY - part.zSphere * sinY;
        const zSphereRot1 = part.xSphere * sinY + part.zSphere * cosY;

        const ySphereRot = part.ySphere * cosX - zSphereRot1 * sinX;
        const zSphereRot = part.ySphere * sinX + zSphereRot1 * cosX;

        const zSpherePx = zSphereRot * R;
        const distToFocal = D + zSpherePx;

        // Perspective scale with safe denominator (minimum 50)
        const scaleSphere = D / Math.max(50, distToFocal);
        
        let sizeSphere = part.starSize * 1.15 * scaleSphere;
        let opacitySphere = 0.8 * (0.6 - 0.42 * zSphereRot);

        // Smooth near-plane clipping fade-out (eliminates popping/flickering)
        if (distToFocal < 150) {
          const fadeFactor = Math.max(0, (distToFocal - 50) / 100);
          const easedFade = easeInOutQuad(fadeFactor);
          sizeSphere *= easedFade;
          opacitySphere *= easedFade;
        }

        const sxSphere = cx + xSphereRot * R * scaleSphere;
        const sySphere = cy + ySphereRot * R * scaleSphere;
        const szSphere = zSpherePx;

        // --- 3. Landscape Target coordinates ---
        // Multi-frequency wave calculation for natural organic flow of undulating ridges
        const waveTime = floatTime * 1.5;
        // Major rolling wave front running diagonally
        const wave1 = Math.sin(part.xLandNorm * 4.0 + waveTime) * Math.cos(part.zLandNorm * 3.0 + waveTime * 0.7) * 0.35;
        // High-frequency secondary ripples for rich water-like texture
        const wave2 = Math.sin(part.xLandNorm * 10.0 - waveTime * 1.1) * Math.sin(part.zLandNorm * 8.0 + waveTime) * 0.12;
        // Minor noise wave for fine details
        const wave3 = Math.cos(part.xLandNorm * 18.0 + waveTime * 1.8) * 0.04;
        const lyNorm = wave1 + wave2 + wave3;

        // Spread the landscape widely to fill the bottom screen edge-to-edge
        // Shifted center slightly left (-0.08) to cover the bottom-left corner of the viewport
        const lx = (part.xLandNorm - 0.08) * (width * 0.78);
        const lz = part.zLandNorm * 230;
        const ly = lyNorm * 165; // increased peak height (deep waves)

        // 3D rotations for the diagonal landscape layout
        const rotY = -0.22; // Rotate around Y to tilt the waves diagonally (looks like the photo!)
        const cosRY = Math.cos(rotY);
        const sinRY = Math.sin(rotY);
        const lxRot = lx * cosRY - lz * sinRY;
        const lzRot = lx * sinRY + lz * cosRY;

        const tiltX = 0.62; // Tilt around X towards camera
        const cosRX = Math.cos(tiltX);
        const sinRX = Math.sin(tiltX);
        const ly2 = ly * cosRX - lzRot * sinRX;
        const lz2 = ly * sinRX + lzRot * cosRX;

        const zLandPx = lz2;
        const D_land = 340; // Focal distance for perspective projection
        const zCam = D_land + zLandPx;
        const scaleLand = D_land / Math.max(50, zCam);
        
        const sxLand = cx + lxRot * scaleLand;
        const syLand = (height * 0.70) + ly2 * scaleLand; // Pushed down to the bottom
        const szLand = zLandPx;
        
        let sizeLand = part.starSize * 1.6 * scaleLand;
        // Fade out as depth increases towards the horizon
        let opacityLand = 0.85 * (1.0 - Math.max(0, zCam - 120) / 480 * 0.72);

        // Bokeh depth-of-field blur effect for foreground particles (closest to camera)
        if (zCam < 160) {
          const nearFactor = (160 - zCam) / 110; // 0 to 1
          sizeLand *= (1.0 + nearFactor * 1.5); // expand core size to simulate blur
          opacityLand *= (1.0 - nearFactor * 0.35); // soften core color
        }

        // Near-plane clipping safety fade-out to prevent popping/flickering
        if (zCam < 150) {
          const fadeFactor = Math.max(0, (zCam - 50) / 100);
          const easedFade = easeInOutQuad(fadeFactor);
          sizeLand *= easedFade;
          opacityLand *= easedFade;
        }

        // Interpolate target variables depending on the scroll progress phase
        let tx = 0, ty = 0, tz = 0, tSize = 0, tOpacity = 0;

        if (p < 0.45) {
          // Morph Phase 1: Starfield -> Sphere
          const t1 = easeInOutQuad(p / 0.45);
          tx = (1 - t1) * sxStar + t1 * sxSphere;
          ty = (1 - t1) * syStar + t1 * sySphere;
          tz = (1 - t1) * szStar + t1 * szSphere;
          tSize = (1 - t1) * sizeStar + t1 * sizeSphere;
          tOpacity = (1 - t1) * opacityStar + t1 * opacitySphere;
        } else if (p < 0.65) {
          // Morph Phase 2: Hold Sphere
          tx = sxSphere;
          ty = sySphere;
          tz = szSphere;
          tSize = sizeSphere;
          tOpacity = opacitySphere;
        } else {
          // Morph Phase 3: Sphere -> Undulating Landscape Wave
          const t2 = easeInOutQuad((p - 0.65) / 0.35);
          tx = (1 - t2) * sxSphere + t2 * sxLand;
          ty = (1 - t2) * sySphere + t2 * syLand;
          tz = (1 - t2) * szSphere + t2 * szLand;
          tSize = (1 - t2) * sizeSphere + t2 * sizeLand;
          tOpacity = (1 - t2) * opacitySphere + t2 * opacityLand;
        }

        // Initialize current position if undefined
        if (part.xCur === undefined || part.yCur === undefined) {
          part.xCur = tx;
          part.yCur = ty;
        }

        // Mouse repel physics based on stable target coordinates to prevent feedback jitter loops
        let pushX = 0;
        let pushY = 0;
        if (mouseRef.current.active) {
          const dx = tx - mouseRef.current.x;
          const dy = ty - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 110; // Immersive repel radius
          if (dist < repelRadius && dist > 0.1) {
            const force = (repelRadius - dist) / repelRadius;
            const angle = Math.atan2(dy, dx);
            const maxPush = 60; // Immersive push force
            // Elastic push away
            pushX = Math.cos(angle) * force * maxPush;
            pushY = Math.sin(angle) * force * maxPush;
          }
        }

        // Apply smooth ease-to-target spring physics
        const targetX = tx + pushX;
        const targetY = ty + pushY;
        part.xCur += (targetX - part.xCur) * springFactor;
        part.yCur += (targetY - part.yCur) * springFactor;

        return {
          x: part.xCur,
          y: part.yCur,
          z: tz, // sort by depth
          size: tSize,
          color: part.color,
          opacity: tOpacity,
        };
      });

      // Painter's algorithm (depth sorting)
      projectedParticles.sort((a, b) => b.z - a.z);

      // Draw connection lines from mouse to particles (Constellation Effect)
      if (mouseRef.current.active) {
        for (let i = 0; i < projectedParticles.length; i++) {
          const part = projectedParticles[i];
          
          // Safety check: skip lines for any corrupted, NaN, or excessively large particles
          if (
            isNaN(part.x) ||
            isNaN(part.y) ||
            isNaN(part.size) ||
            isNaN(part.opacity) ||
            part.size > 8 ||
            part.size < 0 ||
            part.opacity <= 0
          ) {
            continue;
          }

          const dx = part.x - mouseRef.current.x;
          const dy = part.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxLineDist = 95; // Immersive constellation line bounds
          if (dist < maxLineDist) {
            const lineOpacity = (1 - dist / maxLineDist) * 0.18 * part.opacity;
            ctx.strokeStyle = `rgba(${part.color}, ${lineOpacity})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
            ctx.lineTo(part.x, part.y);
            ctx.stroke();
          }
        }
      }

      // Render particle cores and neon halos
      for (let i = 0; i < projectedParticles.length; i++) {
        const part = projectedParticles[i];
        
        // Safety check: skip rendering for any corrupted, NaN, or excessively large particles
        if (
          isNaN(part.x) ||
          isNaN(part.y) ||
          isNaN(part.size) ||
          isNaN(part.opacity) ||
          part.size > 8 ||
          part.size < 0 ||
          part.opacity <= 0
        ) {
          continue;
        }
        
        ctx.fillStyle = `rgba(${part.color}, ${part.opacity})`;
        ctx.beginPath();
        ctx.arc(part.x, part.y, Math.max(0.1, part.size), 0, Math.PI * 2);
        ctx.fill();

        if (part.size > 0.35) {
          ctx.fillStyle = `rgba(${part.color}, ${part.opacity * 0.22})`;
          ctx.beginPath();
          ctx.arc(part.x, part.y, part.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Fade out the initial hero headline, plus icon, and CTA button as scroll increases (with smooth blur reveal)
      if (textRef.current) {
        const textOpacity = Math.max(0, 1 - p * 2.5);
        textRef.current.style.opacity = textOpacity.toString();
        textRef.current.style.transform = `translateY(${p * -50}px)`;
        const textBlur = (1 - textOpacity) * 12;
        textRef.current.style.filter = `blur(${textBlur}px)`;
        textRef.current.style.pointerEvents = textOpacity < 0.05 ? "none" : "auto";
      }

      // Caption 1: Inside the rotating sphere (with smooth blur reveal)
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
        const captionBlur = (1 - opacity) * 12;
        captionRef.current.style.filter = `blur(${captionBlur}px)`;
      }

      // Caption 2: Over the spreading landscape (with smooth blur reveal)
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
        const caption2Blur = (1 - opacity) * 12;
        caption2Ref.current.style.filter = `blur(${caption2Blur}px)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseleave", handleMouseLeave);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full select-none h-[300vh] bg-white">
      {/* Sticky container that stays pinned in the viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center bg-white">
        
        {/* Top Navbar: absolute positioned so it overlays the scene without altering flex centering */}
        <motion.div 
          style={{ y: navbarY, opacity: navbarOpacity }}
          className="absolute top-0 left-0 w-full z-30"
        >
          <Navbar />
        </motion.div>

        {/* Outer wrapper to center the card inside the viewport */}
        <div className="w-full h-full flex items-center justify-center relative z-20">
          <motion.div 
            style={{ 
              width: cardWidth, 
              maxWidth: cardMaxWidth,
              height: cardHeight, 
              borderRadius: borderRadius,
              borderWidth: borderWidth,
            }}
            className="relative bg-[#070c1b]/95 border border-slate-800/40 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden shadow-[0_25px_70px_-10px_rgba(0,0,0,0.7)] p-8"
          >
            
            {/* HTML5 Canvas Particle Animation */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            />

            {/* Hero text overlay (Centered both horizontally and vertically - Fades out on scroll) */}
            <div ref={textRef} className="relative z-10 w-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
              
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
                onClick={onAction}
                className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
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
              <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.85)] leading-tight">
                The autonomous AI workspace that transforms <br className="hidden md:inline" /> your designs into production-ready software.
              </p>
            </div>

            {/* Second Caption overlay (Fades in as particles disperse into 3D landscape) */}
            <div 
              ref={caption2Ref} 
              className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center w-full max-w-7xl mx-auto px-4 pointer-events-none"
              style={{ opacity: 0 }}
            >
              <span className="text-sm md:text-xl font-bold uppercase tracking-[0.4em] text-white/60 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mb-6">
                A
              </span>
              <Image 
                src="/Selsoftinc.webp" 
                alt="Selsoft Inc Logo" 
                width={400} 
                height={150} 
                className="w-56 md:w-80 object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)] mb-6"
                unoptimized
              />
              <span className="text-sm md:text-xl font-bold uppercase tracking-[0.4em] text-white/60 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Product
              </span>
            </div>
            
          </motion.div>
        </div>
      </div>
    </section>
  );
}
