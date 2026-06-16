import { Navbar, Footer } from "@/src/features/landing/components";

export const metadata = {
  title: "Privacy Policy | Wyrefy",
  description: "Read about how Wyrefy collects, processes, and protects your account and usage information securely.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative bg-transparent text-slate-800 antialiased flex flex-col pt-32">
      <Navbar />

      <main className="page-motion overflow-x-hidden flex-1 relative z-10">
        <div className="max-w-[1160px] mx-auto px-6 py-12 w-full flex-1">
          <article className="max-w-3xl mb-32">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-white drop-shadow-sm">Privacy Policy</h1>
            <div className="space-y-6 text-white/90 leading-relaxed text-lg drop-shadow-sm">
              <p>This sample page explains that Wyrefy collects account, authentication, billing, and usage information needed to operate the product securely.</p>
              <p>Final production privacy terms will define retention, subprocessors, support access, and customer data controls before public launch.</p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
