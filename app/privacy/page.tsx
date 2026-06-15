import Link from "next/link";
import { BrandLogo } from "@/src/components/ui/brand-logo";
import { Footer } from "@/src/features/landing/components/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Wyrefy",
  description: "Read about how Wyrefy collects, processes, and protects your account and usage information securely.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col pt-32">
      {/* Glassy Header */}
      <div className="fixed left-0 right-0 top-6 z-50 mx-auto px-6 max-w-[1200px] pointer-events-none">
        <div className="flex h-14 items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-4">
            <Link href="/#footer" className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/20 transition-colors text-white shadow-sm" aria-label="Go Back">
              <ArrowLeft size={16} />
            </Link>
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white no-underline">
              <BrandLogo />
              Wyrefy
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="ml-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 shadow-md hidden sm:inline-block">
              Book a Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1160px] mx-auto px-6 py-12 w-full flex-1">
        <article className="max-w-3xl mb-32">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Privacy Policy</h1>
          <div className="space-y-6 text-white/60 leading-relaxed text-lg">
            <p>This sample page explains that Wyrefy collects account, authentication, billing, and usage information needed to operate the product securely.</p>
            <p>Final production privacy terms will define retention, subprocessors, support access, and customer data controls before public launch.</p>
          </div>
        </article>
      </div>
      <Footer />
    </main>
  );
}
