const categories = [
  {
    label: "Languages & Frameworks",
    items: ["Java", "Spring Boot", "Spring Cloud", "TypeScript", "Node.js"],
  },
  {
    label: "Architecture",
    items: ["Microservices", "DDD", "Hexagonal Arch.", "Event-Driven", "Clean Code", "TDD"],
  },
  {
    label: "Messaging & Data",
    items: ["Apache Kafka", "PostgreSQL", "MongoDB", "Oracle DB", "SQL Server", "Redis"],
  },
  {
    label: "Infrastructure",
    items: ["Kubernetes", "Docker", "AWS", "GCP", "CI/CD", "Terraform"],
  },
  {
    label: "Observability",
    items: ["Grafana", "Prometheus", "Splunk", "Sentry", "OpenTelemetry"],
  },
];

export default function TechStack() {
  return (
    <section id="stack" className="py-28 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,229,160,0.15)] to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="tag mb-4 inline-block">Stack</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#e6edf3]">
            The tools that{" "}
            <span className="text-[#00e5a0]">ship things</span>
          </h2>
          <p className="mt-4 text-[#8b949e] max-w-md mx-auto">
            15 years of production scars — these are the technologies I trust.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="p-6 rounded-xl border border-[rgba(0,229,160,0.08)] bg-[#0d1117] hover:border-[rgba(0,229,160,0.18)] transition-all duration-300"
            >
              <h3 className="text-xs font-mono font-semibold text-[#00e5a0] uppercase tracking-widest mb-4">
                {cat.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 text-sm text-[#e6edf3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg hover:border-[rgba(0,229,160,0.2)] hover:text-[#00e5a0] transition-all duration-200 cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="p-6 rounded-xl border border-dashed border-[rgba(0,229,160,0.15)] bg-[rgba(0,229,160,0.02)] flex flex-col items-center justify-center text-center gap-3">
            <span className="text-3xl" aria-hidden>🛰</span>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              Always learning. Always shipping.
            </p>
            <a
              href="https://diegobarrioh.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#00e5a0] hover:underline"
            >
              Full profile →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
