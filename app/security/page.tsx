import { Navbar, Footer } from "@/src/features/landing/components";

export const metadata = {
  title: "Security | Wyrefy",
  description: "Learn about how Wyrefy secures your data, sandboxes, and integrations.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen relative bg-transparent text-slate-800 antialiased flex flex-col pt-32">
      <Navbar />

      <main className="page-motion overflow-x-hidden flex-1 relative z-10">
        <div className="max-w-[1160px] mx-auto px-6 py-12 w-full flex-1">
          <article className="max-w-3xl mb-32">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-white drop-shadow-sm">Security</h1>
            <div className="space-y-6 text-white/90 leading-relaxed text-lg drop-shadow-sm">
              <p>At Wyrefy, the security of your designs, generated code, and environments is our highest priority.</p>
              <p>Every development sandbox is strictly isolated, ensuring that your data remains securely within your organization&apos;s boundaries. Authentication, API access, and billing are handled with enterprise-grade encryption.</p>
              <p>Comprehensive security documentation and audit logs will be available prior to public launch.</p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
