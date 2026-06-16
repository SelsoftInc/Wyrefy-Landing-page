"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(pathname.replace("/", "") || "home");
      return;
    }

    const handleScroll = () => {
      const sections = ["hero", "features", "pricing"];
      let current = "home";
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2) {
            current = section === "hero" ? "home" : section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navItems = [
    { label: "Home", href: "/", id: "home" },
    { label: "Feature", href: "/#features", id: "features" },
    { label: "Pricing", href: "/#pricing", id: "pricing" },
    { label: "Contact", href: "/contact", id: "contact" },
  ];

  return (
    <div className="fixed left-0 right-0 top-6 z-50 mx-auto px-6 md:px-10 w-full flex items-center justify-between pointer-events-none">
      <div className="pointer-events-auto flex-1 flex justify-start">
        <Link href="https://selsoftinc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center transition-opacity hover:opacity-80 pl-3">
          <Image src="/Selsoftinc.webp" alt="Selsoft Inc" width={140} height={48} className="h-10 w-auto object-contain" unoptimized />
        </Link>
      </div>

      <div className="pointer-events-auto hidden md:flex shrink-0 items-center p-1.5 rounded-full bg-white/40 border border-white/80 backdrop-blur-[40px] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.5)]">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Link 
              key={item.id}
              href={item.href} 
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${
                isActive 
                  ? "bg-white/80 text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-white/60" 
                  : "bg-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="pointer-events-auto flex-1 flex justify-end items-center gap-6">
        <Link 
          href="https://app.wyrefy.com/login" 
          className="hidden text-sm font-semibold text-white/90 drop-shadow-sm transition-all duration-300 hover:text-white hover:scale-105 md:block"
        >
          Login
        </Link>
        <Link 
          href="https://app.wyrefy.com/signup" 
          className="ml-2 rounded-full bg-white/80 backdrop-blur-[20px] border border-white px-6 py-2.5 text-sm font-bold text-slate-800 hover:bg-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(14,165,233,0.6),0_0_60px_rgba(2,132,199,0.4)] hover:scale-105 transition-all duration-200"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
