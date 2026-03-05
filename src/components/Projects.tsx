const projects = [
  {
    id: "akademia",
    featured: true,
    status: "live",
    label: "First release",
    name: "Akademia",
    tagline: "Your AI-powered learning companion",
    description:
      "A platform that transforms how you learn. Built with a clean backend architecture and AI integration to deliver personalized educational experiences. The first project shipped under the backendtothefuture.com umbrella.",
    tags: ["AI", "Spring Boot", "Java", "Backend", "Education"],
    url: "https://akademia.diegobarrioh.dev",
    metrics: [
      { label: "Type", value: "Web App" },
      { label: "Stack", value: "Java + Spring" },
      { label: "Status", value: "Live" },
    ],
  },
];

const upcoming = [
  {
    name: "Project #2",
    hint: "Something in fintech...",
    eta: "Coming soon",
  },
  {
    name: "Project #3",
    hint: "Observability tooling...",
    eta: "In progress",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-28 relative">
      {/* Subtle separator line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(112,0,255,0.15)] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="tag mb-4 inline-block">Projects</span>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--c-text)] leading-tight">
              Things I built<br />
              <span className="text-[#7000ff]">for real</span>
            </h2>
          </div>
          <p className="text-[var(--c-muted)] max-w-xs text-sm leading-relaxed md:text-right">
            Production-grade apps. Not side projects gathering dust — things you can open right now.
          </p>
        </div>

        {/* Featured project */}
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block mb-8 p-8 rounded-2xl border border-[rgba(112,0,255,0.15)] bg-[var(--c-surface)] hover:border-[rgba(112,0,255,0.35)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(112,0,255,0.06)]"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="tag">{project.label}</span>
                  <span className="flex items-center gap-1.5 text-xs font-mono text-[#7000ff]">
                    <span
                      className="w-2 h-2 rounded-full bg-[#7000ff]"
                      style={{ boxShadow: "0 0 6px #7000ff" }}
                    />
                    {project.status}
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-[var(--c-text)] mb-2 group-hover:text-[#7000ff] transition-colors">
                  {project.name}
                </h3>
                <p className="text-[var(--c-muted)] font-mono text-sm mb-4">
                  {project.tagline}
                </p>
                <p className="text-[var(--c-muted)] leading-relaxed mb-6 max-w-xl">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-mono text-[var(--c-muted)] bg-[var(--c-chip-bg)] border border-[var(--c-chip-border)] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-mono font-semibold text-[#7000ff] group-hover:gap-3 transition-all">
                  Open app
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </span>
              </div>

              {/* Right: metrics */}
              <div className="lg:w-48 flex flex-row lg:flex-col gap-4 lg:justify-start">
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="flex-1 lg:flex-none p-4 rounded-xl bg-[rgba(112,0,255,0.04)] border border-[rgba(112,0,255,0.08)] text-center lg:text-left"
                  >
                    <div className="text-xs text-[var(--c-muted)] font-mono mb-1 uppercase tracking-wider">
                      {m.label}
                    </div>
                    <div className="text-sm font-semibold text-[var(--c-text)]">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </a>
        ))}

        {/* Upcoming / teaser cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {upcoming.map((p) => (
            <div
              key={p.name}
              className="p-6 rounded-xl border border-dashed border-[rgba(112,0,255,0.1)] bg-[rgba(112,0,255,0.02)] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[var(--c-text)] font-semibold">{p.name}</span>
                <span className="text-xs font-mono text-[var(--c-muted)] border border-[var(--c-chip-border)] px-2 py-0.5 rounded">
                  {p.eta}
                </span>
              </div>
              <p className="text-sm text-[var(--c-muted)] font-mono">{p.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
