"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/src/features/landing/components/Navbar";
import { HeroSection } from "@/src/features/landing/components/HeroSection";
import { BrandsSection } from "@/src/features/landing/components/BrandsSection";
import { FeaturesSection } from "@/src/features/landing/components/FeaturesSection";
import { ProcessSection } from "@/src/features/landing/components/process/ProcessSection";
import { PricingSection } from "@/src/features/landing/components/PricingSection";
import { Footer } from "@/src/features/landing/components/Footer";
import { ScrollToTop } from "@/src/features/landing/components/ScrollToTop";

export default function Home() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setReady(true));
  }, []);

  const handleAction = () => {
    window.location.href = "https://app.wyrefy.com/signup";
  };

  useEffect(() => {
    if (ready && window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView(), 10);
      }
    }
  }, [ready]);

  if (!ready) {
    return <div className="min-h-screen" />;
  }

  function selectPlan(slug: string) {
    if (slug === "enterprise") {
      window.location.href = "/contact";
      return;
    }
    window.location.href = `https://app.wyrefy.com/signup?plan=${slug}`;
  }

  return (
    <div className="min-h-screen relative bg-transparent text-slate-800 antialiased">
      <style>{`
        :root {
          --bg: var(--background);
          --surface: var(--surface);
          --card: var(--card);
          --card2: color-mix(in srgb, var(--card), var(--foreground) 3%);
          --border: var(--border);
          --border2: color-mix(in srgb, var(--border), var(--foreground) 10%);
          --accent: var(--accent);
          --accent2: var(--accent-strong);
          --accent-em: var(--accent-strong);
          --muted: var(--muted-foreground);
          --muted2: var(--muted);
          --text: var(--foreground);
          --text2: color-mix(in srgb, var(--foreground), transparent 25%);
          --green: rgba(16, 185, 129, 0.9);
          --green-bg: rgba(16, 185, 129, 0.1);
          --green-border: rgba(16, 185, 129, 0.2);
          --r: 14px;
          --r2: 10px;
          --r3: 20px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(-15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .anim { animation: fadeUp .45s ease-out both; }
        .anim-float-slow { animation: float 6s ease-in-out infinite; }
        
        body::-webkit-scrollbar {
          display: none;
        }
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Navbar />

      <main className="page-motion relative z-10">
        <HeroSection onAction={handleAction} />
        <BrandsSection />
        <FeaturesSection />
        <ProcessSection />
        <PricingSection onSelectPlan={selectPlan} />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
