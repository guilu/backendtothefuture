import Link from "next/link";
import BrandMark from "@/components/design-system/BrandMark";
import { ArrowIcon, CubeIcon, LayersIcon, UserIcon } from "@/components/design-system/Icons";

const brandColors = [
  ["Gold", "--gold", "#F9B22B"],
  ["Amber", "--amber", "#FB991F"],
  ["Orange", "--orange", "#FB7A1E"],
  ["Flame", "--flame", "#F4602A"],
  ["Ember", "--ember", "#EE4136"],
] as const;

const lightNeutrals = [
  ["bg", "#EEF2F7"],
  ["bg-2", "#F6F8FB"],
  ["surface", "#FFFFFF"],
  ["surface-2", "#F7F9FC"],
  ["ink", "#17222F"],
  ["body", "#5C6776"],
  ["muted", "#8A93A2"],
] as const;

const darkNeutrals = [
  ["bg", "#0E1620"],
  ["bg-2", "#111B26"],
  ["surface", "#16212E"],
  ["surface-2", "#1B2835"],
  ["ink", "#ECF1F7"],
  ["body", "#9FACBC"],
  ["muted", "#6F7E90"],
] as const;

export const metadata = {
  title: "Backend to the Future — Design System",
  description: "Design system tokens, components and visual language for Backend to the Future.",
  // Internal design reference — keep it out of search results.
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <main>
      <div className="sticky top-0 z-40 py-4">
        <div className="mx-auto max-w-[1080px] px-7">
          <div className="flex items-center gap-4 rounded-2xl border border-[var(--hairline)] bg-[var(--nav-bg)] py-3 pl-5 pr-4 shadow-[var(--shadow-md)] backdrop-blur-[14px]">
            <Link href="/" className="flex items-center gap-3">
              <BrandMark className="h-8 w-11" />
              <span className="brand-word"><span className="brand-word-primary text-[17px]">BACKEND</span><span className="brand-word-secondary text-[8px]">TO THE FUTURE</span></span>
            </Link>
            <span className="ml-auto text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--muted)]">Design System</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-7">
        <header className="py-14">
          <span className="eyebrow"><span className="eyebrow-dot" />Brand & UI foundations</span>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.4rem,1.4rem+2.6vw,3.4rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
            The visual language behind <span className="grad-word">the future.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[1.0625rem] font-medium leading-7 text-[var(--body)]">
            A warm, engineering-grade system: amber-to-ember energy on cool paper, extrabold geometric type, and a recurring chevron-circuit motif that signals backend work moving forward.
          </p>
        </header>

        <Section number="01" title="Color" subtitle="The brand lives in a single warm spectrum. Everything else is cool, near-neutral paper.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {brandColors.map(([name, token, hex]) => (
              <Swatch key={token} name={name} token={token} hex={hex} />
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <GradientCard name="Brand gradient" token="--grad-brand · buttons & CTAs" className="bg-[var(--grad-brand)]" />
            <GradientCard name="Word gradient" token="--grad-word · headline noun" className="bg-[var(--grad-word)]" />
            <GradientCard name="Chevron gradient" token="--grad-chevron · brand motif" className="bg-[var(--grad-chevron)]" />
          </div>
          <NeutralSet title="Light · paper neutrals" items={lightNeutrals} />
          <NeutralSet title="Dark · backend at night" items={darkNeutrals} />
        </Section>

        <Section number="02" title="Typography" subtitle="Plus Jakarta Sans, extrabold for display. One noun per headline takes the word gradient.">
          <div className="rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-7 shadow-[var(--shadow-card)]">
            <TypeRow label="hero · 58"><span className="text-[clamp(2.3rem,5vw,58px)]">Power the <span className="grad-word">future.</span></span></TypeRow>
            <TypeRow label="h2 · 46"><span className="text-[clamp(2rem,4vw,42px)]">Have an idea in mind?</span></TypeRow>
            <TypeRow label="card · 24"><span className="text-2xl">Tech Stack</span></TypeRow>
            <TypeRow label="body · 16"><span className="text-base font-medium text-[var(--body)]">I design and build scalable backend systems and AI-powered tools.</span></TypeRow>
          </div>
        </Section>

        <Section number="03" title="Brand motif" subtitle="Three forward chevrons fed by circuit traces — momentum, backend, the future.">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <MotifCard><BrandMark className="w-[120px]" /><p>Compact chevrons. Pairs with the BACKEND / TO THE FUTURE lockup and prefixes card titles.</p></MotifCard>
            <MotifCard><BrandMark variant="circuit" className="w-full max-w-[420px]" /><p>Full chevron-circuit device. Used as decorative anchor in hero and CTA.</p></MotifCard>
          </div>
        </Section>

        <Section number="04" title="Components" subtitle="Pill buttons, translucent-bordered cards, primary-tinted shadows.">
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Buttons"><a className="btn btn-primary">View Projects <ArrowIcon /></a><a className="btn btn-outline">Read Blog <ArrowIcon /></a></Panel>
            <Panel title="Eyebrow"><span className="eyebrow"><span className="eyebrow-dot" />Backend Engineering</span></Panel>
            <Panel title="Icon badge"><span className="ph-badge"><CubeIcon /></span><span className="ph-badge"><LayersIcon /></span><span className="ph-badge"><UserIcon /></span></Panel>
            <Panel title="List & link"><ul className="space-y-2">{["Java & Spring Boot", "Microservices & Kafka", "Observability & DevOps"].map((item) => <li key={item} className="relative pl-5 text-sm font-medium text-[var(--body)] before:absolute before:left-0 before:top-2 before:h-[7px] before:w-[7px] before:rotate-45 before:rounded-[2px] before:bg-[var(--grad-brand)]">{item}</li>)}</ul><a className="inline-flex items-center gap-2 font-bold text-[var(--orange)]">Explore <ArrowIcon className="h-4 w-4" /></a></Panel>
          </div>
        </Section>

        <Section number="05" title="Radii & elevation" subtitle="Shadows are primary-tinted, never generic gray.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[['Small', '--r-sm · 10px', '10px'], ['Medium', '--r-md · 14px', '14px'], ['Large', '--r-lg · 18px', '18px'], ['Full', '--r-full', '999px']].map(([name, token, radius]) => (
              <div key={token} className="rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5 text-center shadow-[var(--shadow-card)]">
                <div className="mb-3 h-16 border border-[var(--brand-18)] bg-[var(--brand-12)]" style={{ borderRadius: radius }} />
                <div className="font-bold text-[var(--ink)]">{name}</div>
                <div className="font-mono text-xs text-[var(--muted)]">{token}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section number="06" title="Voice & content" subtitle="Confident, technical, forward-looking. Verbs first.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
              <h3 className="mb-4 text-lg text-[var(--ink)]">Principles</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--body)]">
                <li>Direct and engineering-literate — no fluff.</li>
                <li>One noun per headline carries the word gradient.</li>
                <li>Buttons open with a verb: View, Read, Get, Explore.</li>
                <li>Sentence case everywhere; eyebrows in uppercase.</li>
              </ul>
            </div>
            <div className="rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
              <h3 className="mb-4 text-lg text-[var(--ink)]">In the wild</h3>
              <CodeLine>H1 — Building reliable systems that power the future.</CodeLine>
              <CodeLine>Eyebrow — LET'S BUILD THE FUTURE</CodeLine>
              <CodeLine>CTA — Have an idea or a project in mind?</CodeLine>
            </div>
          </div>
        </Section>

        <footer className="border-t border-[var(--hairline)] py-10 text-center text-sm text-[var(--muted)]">
          Backend to the Future — Design System · Plus Jakarta Sans · built from the redesign mockup.
        </footer>
      </div>
    </main>
  );
}

function Section({ number, title, subtitle, children }: { number: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="border-t border-[var(--hairline)] py-8"><div className="mb-6 flex items-baseline gap-3"><span className="font-mono text-sm text-[var(--orange)]">{number}</span><h2 className="text-2xl text-[var(--ink)]">{title}</h2><p className="ml-auto hidden max-w-sm text-right text-sm text-[var(--muted)] md:block">{subtitle}</p></div>{children}</section>;
}
function Swatch({ name, token, hex }: { name: string; token: string; hex: string }) { return <div className="overflow-hidden rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] shadow-[var(--shadow-card)]"><div className="h-24" style={{ background: hex }} /><div className="p-3"><div className="font-bold text-[var(--ink)]">{name}</div><div className="font-mono text-xs text-[var(--orange)]">{token}</div><div className="font-mono text-xs uppercase text-[var(--muted)]">{hex}</div></div></div>; }
function GradientCard({ name, token, className }: { name: string; token: string; className: string }) { return <div className="overflow-hidden rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] shadow-[var(--shadow-card)]"><div className={`h-20 ${className}`} /><div className="p-3"><div className="font-bold text-[var(--ink)]">{name}</div><div className="font-mono text-xs text-[var(--muted)]">{token}</div></div></div>; }
function NeutralSet({ title, items }: { title: string; items: readonly (readonly [string, string])[] }) { return <><h3 className="mt-6 mb-3 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">{title}</h3><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">{items.map(([name, hex]) => <div key={`${title}-${name}`} className="overflow-hidden rounded-[var(--r-md)] border border-[var(--hairline)] bg-[var(--surface)]"><div className="h-16" style={{ background: hex }} /><div className="p-2"><div className="text-xs font-bold text-[var(--ink)]">{name}</div><div className="font-mono text-[11px] uppercase text-[var(--muted)]">{hex}</div></div></div>)}</div></>; }
function TypeRow({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex items-baseline gap-5 border-b border-[var(--hairline-2)] py-4 last:border-0"><span className="w-28 shrink-0 font-mono text-xs text-[var(--muted)]">{label}</span><span className="font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]">{children}</span></div>; }
function MotifCard({ children }: { children: React.ReactNode }) { return <div className="grid place-items-center gap-4 rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-7 text-center text-sm leading-6 text-[var(--body)] shadow-[var(--shadow-card)]">{children}</div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-[var(--r-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]"><h3 className="mb-4 text-lg text-[var(--ink)]">{title}</h3><div className="flex flex-wrap items-center gap-3">{children}</div></div>; }
function CodeLine({ children }: { children: React.ReactNode }) { return <div className="mt-2 rounded-[var(--r-md)] border border-[var(--hairline)] bg-[var(--surface-2)] px-3 py-2 font-mono text-xs leading-6 text-[var(--ink)] first:mt-0">{children}</div>; }
