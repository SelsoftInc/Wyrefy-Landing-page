export function PromoVideoSection() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-6 py-20">
      <div className="flex flex-col items-center text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
          Experience the Future of AI Development
        </h2>
        <p className="text-[var(--muted)] max-w-2xl text-lg">
          Watch how Wyrefy seamlessly turns your ideas and designs into production-ready software.
        </p>
      </div>
      
      <div className="relative w-full mx-auto max-w-[1100px] aspect-video flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/Wyrefy_promo.mp4" type="video/mp4" />
        </video>
        {/* Soft edge blend overlays to fade strictly the edges into the black background */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_40px_rgba(0,0,0,1)] z-10"></div>
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_60px_rgba(0,0,0,0.8)] z-10"></div>
      </div>
    </section>
  );
}
