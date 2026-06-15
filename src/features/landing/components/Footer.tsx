import Link from "next/link";
import Image from "next/image";
import { XIcon, LinkedinIcon } from "@/src/components/ui/brand-icons";

export function Footer() {
  return (
    <footer id="footer" className="block border-t border-slate-200 pt-20 px-10 pb-10 max-w-[1160px] mx-auto text-slate-800 bg-white">
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
            <a href="#" aria-label="X" className="text-slate-500 transition-colors duration-200 flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-350"><XIcon className="size-4" /></a>
            <a href="#" aria-label="LinkedIn" className="text-slate-500 transition-colors duration-200 flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-350"><LinkedinIcon className="size-4" /></a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 flex-1">
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-slate-900 mb-2 uppercase tracking-[0.05em]">Product</h3>
            <Link href="#features" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Features</Link>
            <Link href="#pricing" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Pricing</Link>
            <Link href="#how-it-works" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">How It Works</Link>
            <Link href="#" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Changelog</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-slate-900 mb-2 uppercase tracking-[0.05em]">Company</h3>
            <Link href="#" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">About</Link>
            <Link href="#" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Careers</Link>
            <Link href="/contact" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Contact</Link>
            <Link href="#" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Partners</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-semibold text-slate-900 mb-2 uppercase tracking-[0.05em]">Legal</h3>
            <Link href="/privacy" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Terms of Service</Link>
            <Link href="/security" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Security</Link>
            <Link href="/status" className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-slate-900">Status</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[13px] text-slate-500">© {new Date().getFullYear()} Selsoft Inc. All rights reserved.</p>
        <div className="flex items-center gap-3 text-[13px] text-slate-500">
          <span>A product of</span>
          <Image src="/selsoftinc_black.png" alt="Selsoft Inc" width={120} height={40} className="h-10 w-auto object-contain" unoptimized />
        </div>
      </div>
    </footer>
  );
}
