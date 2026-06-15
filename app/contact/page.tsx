import { Mail, MapPin, ChevronDown } from "lucide-react";
import { Navbar, Footer } from "@/src/features/landing/components";

export default function ContactPage() {
  return (
    <div className="min-h-screen relative bg-black text-white antialiased flex flex-col pt-32">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -z-0 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      
      <Navbar />

      <main className="page-motion overflow-x-hidden flex-1 relative z-10">
        <section className="relative mx-auto max-w-[1200px] px-6 pb-24 md:pb-32 pt-24 md:pt-32">
          
          <div className="relative z-10 grid gap-16 lg:grid-cols-2 lg:gap-24">
            
            {/* Left Column - Contact Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl text-white">
                Get in Touch
              </h1>
              <h2 className="mt-4 text-2xl font-semibold text-white/80">
                Let&apos;s build something remarkable
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/50 max-w-md">
                Have questions about Wyrefy? Our team is here to help you optimize your frontend generation workflow and get your team moving from prompt to production faster.
              </p>

              <div className="mt-12 space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 shadow-sm transition-all group-hover:bg-white/10 group-hover:text-white group-hover:scale-110">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email us</h3>
                    <a href="mailto:info@selsoftinc.com" className="text-white/50 hover:text-white transition-all">
                      info@selsoftinc.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 shadow-sm transition-all group-hover:bg-white/10 group-hover:text-white group-hover:scale-110">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Visit us</h3>
                    <p className="text-white/50">
                      San Francisco, CA, USA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="relative z-10 rounded-[32px] p-8 lg:p-10 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-white/90">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      aria-label="Full Name"
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-white/90">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      aria-label="Email Address"
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-white/90">Subject</label>
                  <div className="relative">
                    <select
                      id="subject"
                      aria-label="Subject"
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    >
                      <option className="bg-black text-white">General Inquiry</option>
                      <option className="bg-black text-white">Enterprise Sales</option>
                      <option className="bg-black text-white">Technical Support</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-white/90">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    aria-label="Message"
                    placeholder="How can we help you?"
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  ></textarea>
                </div>

                <button
                  type="button"
                  className="w-full mt-4 rounded-xl bg-white px-6 py-4 text-base font-semibold text-black shadow-lg transition-transform hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-white/90"
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
