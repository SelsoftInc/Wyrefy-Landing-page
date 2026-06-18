"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation, m as motion } from "motion/react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Feature", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <LazyMotion features={domAnimation}>
    <>
      <nav className="w-full flex items-center py-4 select-none px-6 bg-white border-b border-slate-100 relative z-50">
        {/* Left Selsoft Logo */}
        <div className="flex-1 flex justify-start">
          <Link 
            href="https://selsoftinc.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center transition-opacity hover:opacity-80"
          >
            <Image 
              src="/selsoftinc_black.png" 
              alt="Selsoft Inc" 
              width={170} 
              height={50} 
              className="h-10 md:h-12 w-auto object-contain" 
              unoptimized
            />
          </Link>
        </div>

        {/* Middle Navigation Links - Desktop Only */}
        <div className="hidden lg:flex items-center justify-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-bold tracking-wide text-slate-500 hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 inline-block"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Login / Get Started - Desktop Only */}
        <div className="hidden lg:flex flex-1 justify-end items-center gap-4">
          <Link 
            href="https://app.wyrefy.com/login" 
            className="text-sm font-bold tracking-wide text-slate-500 hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 inline-block"
          >
            Login
          </Link>
          <Link
            href="https://app.wyrefy.com/signup"
            className="px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 bg-slate-900 text-white hover:bg-[#6836E1]"
          >
            Book A Demo
          </Link>
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="flex lg:hidden flex-1 justify-end">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-[#6836E1] transition-colors focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden absolute top-[73px] left-0 right-0 bg-white border-b border-slate-100 shadow-xl overflow-hidden z-40"
          >
            <div className="flex flex-col px-6 py-6 gap-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-bold tracking-wide text-slate-700 hover:text-[#6836E1] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="h-px w-full bg-slate-100 my-2" />
              
              <Link 
                href="https://app.wyrefy.com/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold tracking-wide text-slate-700 hover:text-[#6836E1] transition-colors"
              >
                Login
              </Link>
              <Link
                href="https://app.wyrefy.com/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center px-6 py-4 rounded-xl text-base font-bold shadow-sm active:scale-95 transition-all duration-300 bg-slate-900 text-white hover:bg-[#6836E1]"
              >
                Book A Demo
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
    </LazyMotion>
  );
}
