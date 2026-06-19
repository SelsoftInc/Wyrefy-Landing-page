"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/src/features/landing/components/HeroSection";
import { FeaturesSection } from "@/src/features/landing/components/FeaturesSection";
import { UseCasesSection } from "@/src/features/landing/components/UseCasesSection";
import { PricingSection } from "@/src/features/landing/components/PricingSection";
import { Footer } from "@/src/features/landing/components/Footer";
import { ScrollToTop } from "@/src/features/landing/components/ScrollToTop";
import { AppLoading } from "@/src/components/ui/loading-states";

const handleAction = () => {
  window.location.href = "https://app.wyrefy.com/signup";
};

function selectPlan(slug: string) {
  if (slug === "enterprise") {
    window.location.href = "/contact";
    return;
  }
  window.location.href = `https://app.wyrefy.com/signup?plan=${slug}`;
}

export default function Home() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Show the cool loading screen for 1.5 seconds on initial load
    const timer = setTimeout(() => {
      setReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (ready && window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        timer = setTimeout(() => el.scrollIntoView(), 10);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [ready]);

  if (!ready) {
    return <AppLoading />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://wyrefy.com/#software",
        "name": "Wyrefy",
        "url": "https://wyrefy.com",
        "description": "Wyrefy is an autonomous AI workspace that turns Figma designs and project context into live, production-grade applications.",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Contact for enterprise pricing",
        },
        "author": {
          "@type": "Organization",
          "@id": "https://selsoftinc.com/#organization",
          "name": "Selsoft Inc",
          "url": "https://selsoftinc.com",
        },
        "image": "https://wyrefy.com/og-image.png",
        "screenshot": "https://wyrefy.com/og-image.png",
      },
      {
        "@type": "Organization",
        "@id": "https://selsoftinc.com/#organization",
        "name": "Selsoft Inc",
        "url": "https://selsoftinc.com",
        "logo": "https://wyrefy.com/selsoftinc_black.png",
        "sameAs": [
          "https://twitter.com/wyrefy",
          "https://linkedin.com/company/selsoft-inc",
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "info@selsoftinc.com",
          "contactType": "customer support",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://wyrefy.com/#website",
        "url": "https://wyrefy.com",
        "name": "Wyrefy",
        "description": "Autonomous AI Frontend Workspace",
        "publisher": {
          "@id": "https://selsoftinc.com/#organization",
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://wyrefy.com/?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="min-h-screen relative bg-white text-slate-800 antialiased">

      <main className="page-motion relative z-10 bg-white">
        <HeroSection onAction={handleAction} />
        <FeaturesSection />
        <UseCasesSection />
        <PricingSection onSelectPlan={selectPlan} />
        <Footer />
      </main>

      <ScrollToTop />
    </div>
    </>
  );
}
