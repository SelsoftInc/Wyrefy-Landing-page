"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar({
  user,
  onSignOut,
}: {
  user?: unknown;
  onSignOut?: () => void;
}) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    // If not on the homepage, the active section is the pathname without the slash
    if (pathname !== "/") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection(pathname.replace("/", "") || "home");
      return;
    }

    const handleScroll = () => {
      const sections = ["hero", "features", "pricing"];
      let current = "home";
      
      // Find the deepest section currently scrolled into view
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the section is near or above the middle of the screen
          if (rect.top <= window.innerHeight / 2) {
            current = section === "hero" ? "home" : section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount
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
      {/* Left: Logo */}
      <div className="pointer-events-auto flex-1 flex justify-start">
        <Link href="https://selsoftinc.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center transition-opacity hover:opacity-80 pl-3">
          <Image src="/Selsoftinc.webp" alt="Selsoft Inc" width={140} height={48} className="h-10 w-auto object-contain" unoptimized />
        </Link>
      </div>

      {/* Center: Pill Navigation */}
      <div className="pointer-events-auto hidden md:flex shrink-0 items-center p-1 rounded-full bg-white/80 border border-slate-200/80 backdrop-blur-md shadow-[0_8px_32px_rgba(59,130,246,0.08)]">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Link 
              key={item.id}
              href={item.href} 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                isActive 
                  ? "bg-blue-600/10 text-blue-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_12px_rgba(37,99,235,0.15)]" 
                  : "bg-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="pointer-events-auto flex-1 flex justify-end items-center gap-4">
        {user ? (
          <>
            <Link 
              href="/dashboard" 
              className="hidden text-sm font-medium text-white/80 transition-colors hover:text-white md:block"
            >
              Dashboard
            </Link>
            <button 
              onClick={onSignOut}
              className="ml-2 rounded-full bg-slate-100 border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-800 transition-all hover:bg-slate-200 shadow-sm cursor-pointer"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/login" 
              className="hidden text-sm font-medium text-white/80 transition-colors hover:text-white md:block"
            >
              Login
            </Link>
            
            <Link 
              href="/contact" 
              className="ml-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-blue-700 shadow-md"
            >
              Book a Demo
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
