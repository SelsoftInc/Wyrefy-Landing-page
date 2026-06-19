import { Mail, MapPin } from "lucide-react";
import { Navbar, Footer } from "@/src/features/landing/components";
import { ContactForm } from "./ContactForm";
export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the Wyrefy team to learn more about our enterprise solutions.",
  alternates: {
    canonical: "https://wyrefy.com/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen relative bg-[#FAF9FD] text-slate-900 antialiased flex flex-col pt-32">
      
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="page-motion overflow-x-hidden flex-1 relative z-10">
        <section className="relative mx-auto max-w-[1200px] px-6 pb-24 md:pb-32 pt-24 md:pt-32">
          
          <div className="relative z-10 grid gap-16 lg:grid-cols-2 lg:gap-24">
            
            {/* Left Column - Contact Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-slate-900">
                Get in Touch
              </h1>
              <h2 className="mt-4 text-2xl font-semibold text-[#6836E1]">
                Let&apos;s build something remarkable
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-md">
                Have questions about Wyrefy? Our team is here to help you optimize your frontend generation workflow and get your team moving from prompt to production faster.
              </p>

              <div className="mt-12 space-y-8">
                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 group-hover:border-[#6836E1]/30 group-hover:bg-indigo-50/50 group-hover:text-[#6836E1] group-hover:scale-110">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Email us</h3>
                    <a href="mailto:sibisbs5161@gmail.com" className="font-semibold text-slate-500 hover:text-[#6836E1] transition-all duration-300">
                      info@selsoftinc.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-pointer">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 group-hover:border-[#6836E1]/30 group-hover:bg-indigo-50/50 group-hover:text-[#6836E1] group-hover:scale-110">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Visit us</h3>
                    <p className="font-semibold text-slate-500">
                      303 S Jupiter Rd Suite 110<br />
                      Allen TX 75002 USA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <ContactForm />

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
