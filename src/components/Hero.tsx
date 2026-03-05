export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg grid-fade" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[rgba(112,0,255,0.04)] blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Pre-title badge */}
        <div className="flex justify-center mb-8">
          <span className="tag">
            <span className="w-2 h-2 rounded-full bg-[#7000ff] mr-2 inline-block" style={{ boxShadow: "0 0 6px #7000ff" }} />
            Senior Backend Engineer · 15+ years
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#e6edf3] leading-none mb-6">
          <span className="block">Building the</span>
          <span className="block text-[#7000ff] relative">
            Backend
            <span className="absolute -right-4 top-0 text-[#7000ff] opacity-30 font-mono text-2xl">_</span>
          </span>
          <span className="block">of Tomorrow</span>
        </h1>

        {/* Terminal subtitle */}
        <div className="flex justify-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-sm text-[#7000ff] bg-[rgba(112,0,255,0.06)] border border-[rgba(112,0,255,0.15)]"
            style={{ boxShadow: "0 0 20px rgba(112,0,255,0.05)" }}
          >
            <span className="text-[#8b949e]">~$</span>
            <span className="cursor-blink">
              java · spring · microservices · kafka · k8s
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg text-[#8b949e] leading-relaxed mb-12">
          I design and build{" "}
          <span className="text-[#e6edf3]">scalable backend platforms</span> with Java &amp;
          Spring. Focused on microservices, clean architecture, observability, and
          rigorous engineering — from{" "}
          <span className="text-[#e6edf3]">fintech</span> to{" "}
          <span className="text-[#e6edf3]">mobility</span>.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#projects"
            className="group px-8 py-3 font-mono font-semibold text-white bg-[#7000ff] rounded hover:bg-[#5c00d6] transition-all duration-200 shadow-lg hover:shadow-[0_0_30px_rgba(112,0,255,0.35)]"
          >
            View Projects
            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
          </a>
          <a
            href="https://diegobarrioh.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 font-mono font-semibold text-[#7000ff] border border-[rgba(112,0,255,0.3)] rounded hover:border-[rgba(112,0,255,0.6)] hover:bg-[rgba(112,0,255,0.05)] transition-all duration-200"
          >
            Portfolio ↗
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto border-t border-[rgba(112,0,255,0.1)] pt-10">
          {[
            { value: "15+", label: "Years of experience" },
            { value: "3", label: "Industries shipped" },
            { value: "∞", label: "Commits to prod" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black text-[#7000ff] font-mono">
                {stat.value}
              </div>
              <div className="text-xs text-[#8b949e] mt-1 leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#8b949e]">
        <span className="text-xs font-mono tracking-widest uppercase opacity-50">scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-[rgba(112,0,255,0.4)] to-transparent" />
      </div>
    </section>
  );
}
