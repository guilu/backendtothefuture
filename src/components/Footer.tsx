export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(112,0,255,0.08)] py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <a href="#" className="font-mono text-sm text-[var(--c-muted)] hover:text-[#7000ff] transition-colors">
          <span className="text-[#7000ff] opacity-60">&#62; </span>
          backendtothefuture.com
        </a>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs font-mono text-[var(--c-muted)]">
          <a href="https://diegobarrioh.dev" target="_blank" rel="noopener noreferrer" className="hover:text-[#7000ff] transition-colors">
            Portfolio
          </a>
          <a href="https://akademia.diegobarrioh.dev" target="_blank" rel="noopener noreferrer" className="hover:text-[#7000ff] transition-colors">
            Akademia
          </a>
          <a href="https://www.linkedin.com/in/diegobarrioh" target="_blank" rel="noopener noreferrer" className="hover:text-[#7000ff] transition-colors">
            LinkedIn
          </a>
          <a href="mailto:diegobarrioh@gmail.com" className="hover:text-[#7000ff] transition-colors">
            Email
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs font-mono text-[var(--c-muted)]">
          © {year} Diego Barrio — built with Next.js
        </p>
      </div>
    </footer>
  );
}
