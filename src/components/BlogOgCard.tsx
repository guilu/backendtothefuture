import { OG_WIDTH, OG_HEIGHT, OG_SCALE, type OgCardModel } from "@/lib/og";

/**
 * The picture LinkedIn, Twitter and Slack show for the blog index.
 *
 * <p>This is a poster, not a page. Its predecessor was a screenshot of the blog
 * index, which failed for a reason no amount of resolution could fix: the index
 * is laid out for a 1200 px window, the feed card is painted around 550 px
 * wide, and everything on it therefore arrived at 45% of its designed size —
 * 18 px card titles at 8 px, 9 px tags at 4 px. Sharp pixels of illegible text.
 *
 * <p>So the sizes below are chosen against the size the card is *seen* at, not
 * the size of the file: nothing that has to be read is under 22 px here, which
 * survives the downscale at 10 px or more. That budget is also why so little
 * fits — one headline, one article, one number.
 *
 * <p>Rendered at {@link OG_WIDTH} ÷ {@link OG_SCALE} CSS pixels and captured by
 * `scripts/og-shot.mjs` at {@link OG_SCALE}× density.
 */

const THUMB_PLACEHOLDER = "/blog/placeholder-thumb.png";

/** The art bleeds off the right edge and dissolves toward the headline. */
const MASK = "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.35) 34%, #000 72%)";

const COPY = {
  es: {
    title: "Blog",
    subtitle: "Artículos escritos por mis agentes de IA sobre las sesiones que implementamos.",
    kicker: "Último artículo",
    count: (n: number) => `${n} ${n === 1 ? "artículo" : "artículos"}`,
  },
  en: {
    title: "Blog",
    subtitle: "Articles written by my AI agents about the sessions we implement.",
    kicker: "Latest article",
    count: (n: number) => `${n} ${n === 1 ? "article" : "articles"}`,
  },
} as const;

export default function BlogOgCard({ model }: { model: OgCardModel }) {
  const copy = COPY[model.lang];
  const latest = model.latest;

  return (
    <div
      // Fixed pixel box, not a responsive layout: there is exactly one viewport
      // this is ever rendered at, and it is set by the capture script.
      style={{ width: OG_WIDTH / OG_SCALE, height: OG_HEIGHT / OG_SCALE }}
      className="relative flex overflow-hidden">
      {/* Brand signature along the top edge. Inline because Tailwind reads
          `bg-[var(--x)]` as a background-COLOR and a gradient in that slot is
          silently dropped — the bar rendered as nothing until it moved here. */}
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "var(--grad-brand)" }} />

      <div className="flex flex-1 flex-col justify-between p-16 pr-10">
        <div className="flex items-center gap-4">
          <img src="/img/logo.png" alt="" className="h-16 w-auto" />
          <span className="flex flex-col leading-none">
            <span className="text-[34px] font-extrabold tracking-tight text-[var(--ink)]">BACKEND</span>
            <span className="mt-1.5 text-[16px] font-extrabold tracking-[0.2em] text-[var(--orange)]">
              TO THE FUTURE
            </span>
          </span>
        </div>

        <div>
          <h1 className="text-[104px] font-extrabold leading-none text-[var(--ink)]">{copy.title}</h1>
          <p className="mt-5 max-w-[600px] text-[30px] leading-snug text-[var(--body)]">{copy.subtitle}</p>
        </div>

        {latest ? (
          <div>
            <div className="flex items-center gap-3 font-mono text-[22px] uppercase tracking-wider text-[var(--orange)]">
              <span className="h-px w-10 bg-[var(--orange)]" />
              {copy.kicker}
              <span className="text-[var(--body)]">{latest.date}</span>
            </div>
            {/* Two lines is the budget; a longer title is cut rather than
                allowed to push the footer off the card. */}
            <p className="mt-3 line-clamp-2 max-w-[620px] text-[46px] font-extrabold leading-tight text-[var(--ink)]">
              {latest.title}
            </p>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-4 font-mono text-[22px] text-[var(--body)]">
          backendtothefuture.com
          <span className="text-[var(--hairline)]">/</span>
          {copy.count(model.postCount)}
        </div>
      </div>

      <div className="w-[470px] shrink-0">
        {/*
          Faded with a mask rather than covered with a gradient overlay. An
          overlay had to name a colour to fade *to*, and the flat `--bg` it named
          is not what is behind it: the page ground is a radial gradient, so the
          two met in a hard vertical seam down the middle of the card. A mask
          removes the art instead of painting over it, and whatever the ground
          happens to be there shows through unbroken.
        */}
        <img
          src={latest?.thumb ?? THUMB_PLACEHOLDER}
          alt=""
          className="h-full w-full object-cover"
          style={{
            maskImage: MASK,
            WebkitMaskImage: MASK,
          }}
        />
      </div>
    </div>
  );
}
