import Link from "next/link";
import Image from "next/image";
import { XIcon, LinkedinIcon } from "@/src/components/ui/brand-icons";

export function Footer() {
  return (
    <footer id="footer" className="block px-4 md:px-10 pb-10 max-w-[1240px] mx-auto relative z-10">
      <div className="rounded-[40px] p-10 md:p-14 bg-white/30 backdrop-blur-[40px] border border-white/40 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.2)] text-slate-800">
        <div className="flex flex-col md:flex-row justify-between gap-[60px] mb-[60px] flex-wrap">
          <div className="max-w-[320px] flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 text-xl font-bold no-underline text-slate-900">
              <Image src="/black_wyrefy_logo.png" alt="Wyrefy Logo" width={32} height={32} className="h-8 w-auto object-contain" />
              <span>Wyrefy</span>
            </Link>
            <p className="text-sm text-slate-500 leading-[1.6]">
              The autonomous AI workspace that transforms your designs into production-ready software.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" aria-label="X" className="text-slate-500 transition-all duration-200 flex items-center justify-center w-10 h-10 rounded-full bg-white/60 shadow-sm border border-white hover:text-slate-800 hover:bg-white hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(14,165,233,0.6),0_0_60px_rgba(2,132,199,0.4)]"><XIcon className="size-4" /></a>
              <a href="#" aria-label="LinkedIn" className="text-slate-500 transition-all duration-200 flex items-center justify-center w-10 h-10 rounded-full bg-white/60 shadow-sm border border-white hover:text-slate-800 hover:bg-white hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(14,165,233,0.6),0_0_60px_rgba(2,132,199,0.4)]"><LinkedinIcon className="size-4" /></a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 flex-1">
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] font-bold text-slate-800 mb-2 uppercase tracking-widest">Product</h3>
              <Link href="#features" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Features</Link>
              <Link href="#pricing" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Pricing</Link>
              <Link href="#how-it-works" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">How It Works</Link>
              <Link href="#" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Changelog</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] font-bold text-slate-800 mb-2 uppercase tracking-widest">Company</h3>
              <Link href="#" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">About</Link>
              <Link href="#" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Careers</Link>
              <Link href="/contact" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Contact</Link>
              <Link href="#" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Partners</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] font-bold text-slate-800 mb-2 uppercase tracking-widest">Legal</h3>
              <Link href="/privacy" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Terms of Service</Link>
              <Link href="/security" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Security</Link>
              <Link href="/status" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-800">Status</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-300/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[13px] font-medium text-slate-500">© {new Date().getFullYear()} Selsoft Inc. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[13px] font-medium text-slate-500">
            <span>A product of</span>
            <Image src="/selsoftinc_black.png" alt="Selsoft Inc" width={120} height={40} className="h-10 w-auto object-contain opacity-70" unoptimized />
          </div>
        </div>
      </div>
    </footer>
  );
}
