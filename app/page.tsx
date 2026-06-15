"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { me, publicPlans, logout } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { routeForUser } from "@/src/features/auth/routing";
import type { User } from "@/src/features/auth/types";
import { Navbar } from "@/src/features/landing/components/Navbar";
import { HeroSection } from "@/src/features/landing/components/HeroSection";
import { BrandsSection } from "@/src/features/landing/components/BrandsSection";
import { FeaturesSection } from "@/src/features/landing/components/FeaturesSection";
import { ProcessSection } from "@/src/features/landing/components/process/ProcessSection";
import { PricingSection } from "@/src/features/landing/components/PricingSection";
import { Footer } from "@/src/features/landing/components/Footer";
import { ScrollToTop } from "@/src/features/landing/components/ScrollToTop";

const visitKey = "wyrefy-has-visited";

export default function Home() {
  const { replace, push } = useRouter();
  const [ready, setReady] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [showOrgSelection, setShowOrgSelection] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const plans = useQuery({ queryKey: queryKeys.publicPlans("individual"), queryFn: () => publicPlans("individual"), enabled: ready });

  useEffect(() => {
    if (localStorage.getItem(visitKey)) {
      me()
        .then((result) => {
          setUser(result.user);
          replace(routeForUser(result.user));
        })
        .catch(() => {
          // Not logged in — show the landing page normally
          queueMicrotask(() => setReady(true));
        });
      return;
    }
    localStorage.setItem(visitKey, "true");
    me().then((result) => setUser(result.user)).catch(() => {});
    queueMicrotask(() => setReady(true));
  }, [replace]);

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const handleAction = () => {
    if (user) {
      push(routeForUser(user));
    } else {
      setShowOrgSelection(true);
    }
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
      push("/contact");
      return;
    }
    setCheckoutPlan(slug);
  }
  const selectedPlan = (plans.data ?? []).find((plan) => plan.slug === checkoutPlan);

  return (
    <div className="min-h-screen relative bg-white text-slate-800 antialiased">
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
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes preview-glow {
          0%, 100% { box-shadow: inset 0 0 0 1px var(--border); }
          50% { box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.3); }
        }
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .anim { animation: fadeUp .45s ease-out both; }
        .anim-float-slow { animation: float 6s ease-in-out infinite; }
        .anim-float-med { animation: float 4.5s ease-in-out infinite 1s; }
        .anim-float-fast { animation: float-fast 3s ease-in-out infinite .5s; }

        /* Hide scrollbar for the landing page */
        body::-webkit-scrollbar {
          display: none;
        }
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Dynamic Animated Grainient Background */}
      {/*
      <div className="absolute top-0 left-0 right-0 h-[120vh] overflow-hidden z-0 pointer-events-none">
        <Grainient
          color1="#171d55"
          color2="#5227FF"
          color3="#17204f"
          timeSpeed={2.85}
          colorBalance={0.2}
          warpStrength={0.4}
          warpFrequency={5}
          warpSpeed={1.5}
          warpAmplitude={26}
          blendAngle={63}
          blendSoftness={0.43}
          rotationAmount={370}
          noiseScale={0.55}
          grainAmount={0.16}
          grainScale={2.7}
          grainAnimated={false}
          contrast={1.5}
          gamma={0.6}
          saturation={1.2}
          centerX={-0.12}
          centerY={-0.34}
          zoom={1.3}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_60%,rgba(0,0,0,1)_95%,#000_100%)]"></div>
      </div>
      */}

      <Navbar user={user} onSignOut={handleSignOut} />

      <main className="page-motion relative z-10">
        {/* Hero Section */}
        <HeroSection isAuthenticated={!!user} onAction={handleAction} />

        <BrandsSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Process/How It Works Section */}
        <ProcessSection />

        {/* Pricing Section */}
        <PricingSection plans={plans.data ?? []} onSelectPlan={selectPlan} />
      </main>

      <Footer />
      {checkoutPlan && typeof document !== "undefined" && createPortal(
        <dialog
          open
          aria-label="Continue to billing"
          className="fixed inset-0 z-50 flex items-center justify-center border-none bg-black/40 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setCheckoutPlan(null)}
            className="absolute inset-0 w-full h-full cursor-default border-none bg-transparent"
          />
          <div className="relative z-10 w-full max-w-md flex flex-col rounded-3xl overflow-hidden max-h-[90vh] bg-white border border-slate-200 shadow-[0_30px_100px_rgba(0,0,0,0.1)]">
            <div data-lenis-prevent="true" className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Continue to billing</h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">{selectedPlan?.name ?? "Selected plan"}</p>
              <p className="mt-6 text-sm font-medium text-slate-650 leading-relaxed">
                Sign in or create an account before opening Stripe checkout.
              </p>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setCheckoutPlan(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer">Cancel</button>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem("wyrefy-selected-plan", checkoutPlan);
                    push(`/login?plan=${checkoutPlan}`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Continue to login
                </button>
              </div>
            </div>
          </div>
        </dialog>,
        document.body
      )}

      {/* Organization vs Individual Modal */}
      {showOrgSelection && typeof document !== "undefined" && createPortal(
        <dialog
          open
          aria-label="Select Account Type"
          className="fixed inset-0 z-50 flex items-center justify-center border-none bg-black/60 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowOrgSelection(false)}
            className="absolute inset-0 w-full h-full cursor-default border-none bg-transparent"
          />
          <div className="relative z-10 w-full max-w-md flex flex-col rounded-[32px] overflow-hidden max-h-[90vh] bg-white border border-slate-200 shadow-[0_30px_100px_rgba(0,0,0,0.1),0_10px_30px_rgba(59,130,246,0.05)]">
            <div data-lenis-prevent="true" className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2 text-center">How will you use Wyrefy?</h2>
              <p className="text-sm text-slate-500 text-center mb-8">Choose your account type to continue.</p>
              
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => push("/signup")}
                  className="group relative flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-350 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-base font-semibold text-slate-800 mb-1">Individual Project</span>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">For Personal Use</span>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-600 group-hover:text-white transition-colors">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
 
                <button
                  type="button"
                  onClick={() => push("/signup?org=true")}
                  className="group relative flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-350 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-base font-semibold text-slate-800 mb-1">Organization</span>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">For Teams & Companies</span>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-600 group-hover:text-white transition-colors">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
              </div>
 
              <button
                type="button"
                onClick={() => setShowOrgSelection(false)}
                className="mt-6 w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>,
        document.body
      )}

      <ScrollToTop />
    </div>
  );
}
