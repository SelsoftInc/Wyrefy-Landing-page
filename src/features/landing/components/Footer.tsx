"use client";

import Link from "next/link";
import Image from "next/image";
import { XIcon, LinkedinIcon } from "@/src/components/ui/brand-icons";

export function Footer() {
  return (
    <footer className="w-full bg-[#FAF9FD] border-t border-slate-300 py-16 px-6 select-none" id="footer">
      <div className="w-full max-w-[1400px] mx-auto">
        
        {/* Upper Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 items-start">
          
          {/* Brand Column (Left) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 text-xl font-bold no-underline text-slate-900">
              <Image 
                src="/black_wyrefy_logo.png" 
                alt="Wyrefy Logo" 
                width={32} 
                height={32} 
                className="h-8 w-auto object-contain" 
              />
              <span>Wyrefy</span>
            </Link>
            
            <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-sm">
              The autonomous AI workspace that transforms your designs into production-ready software.
            </p>

            <div className="flex gap-4 mt-2">
              <a href="https://x.com/Selsoftx" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-slate-400 hover:text-[#6836E1] hover:-translate-y-1 hover:scale-110 transition-all duration-300 inline-block">
                <XIcon className="size-5" />
              </a>
              <a href="https://www.linkedin.com/company/selsoft-inc-/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 hover:text-[#6836E1] hover:-translate-y-1 hover:scale-110 transition-all duration-300 inline-block">
                <LinkedinIcon className="size-5" />
              </a>
            </div>
          </div>

          {/* Nav Links Column (Right side, split into 3) */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">Product</h3>
              <Link href="#features" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">Features</Link>
              <Link href="#pricing" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">Pricing</Link>
              <Link href="#use-cases" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">Use Cases</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">Company</h3>
              <Link href="https://selsoftinc.com/about" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">About</Link>
              <Link href="https://selsoftinc.com/careers" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">Careers</Link>
              <Link href="https://selsoftinc.com/contact" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">Contact</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-widest">Legal</h3>
              <Link href="/privacy" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">Privacy Policy</Link>
              <Link href="/terms" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">Terms of Service</Link>
              <Link href="/security" className="text-sm font-semibold text-slate-500 no-underline hover:text-[#6836E1] hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 origin-left inline-block w-fit">Security</Link>
            </div>
          </div>

        </div>

        {/* Lower Row: Attribution and copyright */}
        <div className="border-t border-slate-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400 tracking-wider">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Selsoft Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-3">
            <span>A PRODUCT OF</span>
            <Image 
              src="/selsoftinc_black.png" 
              alt="Selsoft Inc" 
              width={110} 
              height={36} 
              className="h-8 w-auto object-contain opacity-70" 
              unoptimized 
            />
          </div>
        </div>

      </div>
    </footer>
  );
}
