import Link from "next/link";

export function WaysToUseSection() {
  return (
    <section className="relative z-10 flex flex-col items-center px-5 pt-10 pb-[100px]">
      <div className="w-full max-w-[1000px]">
        <h2 className="text-center text-base text-[#aaa] font-medium mb-8">Ways to use Wyrefy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#141419]/40 backdrop-blur-xl border border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-white/15">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-[20px] font-semibold text-white mb-2">Wyrefy for product teams</h3>
              <p className="text-[15px] text-[#aaa] leading-relaxed mb-8">Gets tasks and projects done from start to finish.</p>
            </div>
            <Link href="/signup" className="mt-auto inline-block text-center rounded-full bg-white/5 border border-white/10 text-white px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-white/10 no-underline">
              Learn more
            </Link>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#141419]/40 backdrop-blur-xl border border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-white/15">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-[20px] font-semibold text-white mb-2">Wyrefy for developers</h3>
              <p className="text-[15px] text-[#aaa] leading-relaxed mb-8">Built for real engineering work, across multiple surfaces.</p>
            </div>
            <Link href="/signup" className="mt-auto inline-block text-center rounded-full bg-white/5 border border-white/10 text-white px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-white/10 no-underline">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
