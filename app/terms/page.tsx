import { Navbar, Footer } from "@/src/features/landing/components";

export const metadata = {
  title: "Terms & Conditions | Wyrefy",
  description: "Read the terms and conditions for using the Wyrefy platform safely, securely, and lawfully.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen relative bg-[#FAF9FD] text-slate-900 antialiased flex flex-col pt-32">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="page-motion overflow-x-hidden flex-1 relative z-10">
        <div className="max-w-[1160px] mx-auto px-6 py-12 w-full flex-1">
          <article className="max-w-3xl mb-32">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-slate-900">Terms & Conditions</h1>
            <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-lg">
              <p>This sample page outlines basic use expectations for Wyrefy. You agree to use the platform lawfully, protect your account credentials, and avoid uploading content you do not have permission to use.</p>
              <p>Generated output, billing terms, organization access, and service availability will be governed by the final production terms before launch.</p>
            </div>
          </article>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
