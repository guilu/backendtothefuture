type BrandMarkProps = {
  variant?: "compact" | "circuit";
  className?: string;
  title?: string;
};

export function BrandDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bttfMarkGrad" x1="0" y1="0" x2="0.72" y2="1">
          <stop offset="0" stopColor="#FBBA10" />
          <stop offset=".5" stopColor="#FB7C1B" />
          <stop offset="1" stopColor="#F23A1C" />
        </linearGradient>
        <linearGradient id="bttfLogoGrad" x1="60" y1="46" x2="310" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FBBA10" />
          <stop offset=".52" stopColor="#FB7C1B" />
          <stop offset="1" stopColor="#F23A1C" />
        </linearGradient>
        <symbol id="bttf-chev-mark" viewBox="0 0 50 32">
          <g fill="none" stroke="url(#bttfMarkGrad)" strokeWidth="2.6" strokeLinecap="butt" strokeLinejoin="round">
            <path d="M11 10 H6" />
            <path d="M11 22 H6" />
          </g>
          <g fill="none" stroke="url(#bttfMarkGrad)" strokeWidth="2.6">
            <circle cx="4.2" cy="10" r="1.8" />
            <circle cx="4.2" cy="22" r="1.8" />
          </g>
          <g fill="none" stroke="url(#bttfMarkGrad)" strokeWidth="4.4" strokeLinecap="butt" strokeLinejoin="miter">
            <polyline points="13,5 22,16 13,27" />
            <polyline points="24,5 33,16 24,27" />
            <polyline points="35,5 44,16 35,27" />
          </g>
        </symbol>
        <symbol id="bttf-chevron-circuit" viewBox="0 0 346 210">
          <g fill="none" stroke="url(#bttfLogoGrad)" strokeWidth="6" strokeLinecap="butt" strokeLinejoin="round">
            <path d="M66 60 H104 V76 H150" />
            <path d="M61 90 H120 V94 H150" />
            <path d="M67 123 H112 V108 H150" />
            <path d="M75 153 H138 V138 H150" />
            <circle cx="57" cy="60" r="8.5" />
            <circle cx="52" cy="90" r="8.5" />
            <circle cx="58" cy="123" r="8.5" />
            <circle cx="66" cy="153" r="8.5" />
          </g>
          <g fill="none" stroke="url(#bttfLogoGrad)" strokeWidth="30" strokeLinecap="butt" strokeLinejoin="miter">
            <polyline points="150,46 206,105 150,164" />
            <polyline points="212,46 268,105 212,164" />
            <polyline points="274,46 330,105 274,164" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

export default function BrandMark({ variant = "compact", className, title }: BrandMarkProps) {
  const isCircuit = variant === "circuit";

  return (
    <svg
      viewBox={isCircuit ? "0 0 346 210" : "0 0 50 32"}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <use href={isCircuit ? "#bttf-chevron-circuit" : "#bttf-chev-mark"} />
    </svg>
  );
}
