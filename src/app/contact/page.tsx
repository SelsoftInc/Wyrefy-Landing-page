import { Mail, MapPin, ChevronDown } from "lucide-react";
import { Navbar, Footer } from "@/src/features/landing/components";

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
            <div className="relative z-10 rounded-[2.5rem] p-8 lg:p-10 bg-white border-2 border-slate-200 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-indigo-200">
              <form action="mailto:info@selsoftinc.com" method="post" encType="text/plain" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      aria-label="Full Name"
                      placeholder="John Doe"
                      className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#6836E1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6836E1]/10 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      aria-label="Email Address"
                      placeholder="john@example.com"
                      className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#6836E1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6836E1]/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Subject</label>
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      aria-label="Subject"
                      className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-900 focus:border-[#6836E1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6836E1]/10 transition-all shadow-sm"
                    >
                      <option className="bg-white text-slate-900">General Inquiry</option>
                      <option className="bg-white text-slate-900">Enterprise Sales</option>
                      <option className="bg-white text-slate-900">Technical Support</option>
                    </select>
                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    aria-label="Message"
                    placeholder="How can we help you?"
                    className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#6836E1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6836E1]/10 transition-all shadow-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 rounded-full bg-slate-900 px-6 py-5 text-sm uppercase tracking-widest font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#6836E1] hover:shadow-[0_20px_40px_rgba(104,54,225,0.25)] active:scale-95"
                >
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
