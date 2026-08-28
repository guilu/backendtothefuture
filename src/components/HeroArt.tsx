"use client";

import { useLang } from "@/context/LangContext";

/**
 * El arte del hero: el dominio en el centro, los adaptadores fuera.
 *
 * <p>Dice «arquitectura limpia» sin escribir la palabra, que es justo lo que
 * la lede promete dos párrafos antes. Todo son tokens y vector — ni una imagen
 * fija — porque el hueco tiene que funcionar igual en claro y en oscuro; el
 * arte de la sección de contacto se resolvió con un PNG y por eso hoy
 * desaparece en tema oscuro.
 *
 * <p>Decorativo para lectores de pantalla: las etiquetas (HTTP, Kafka…) son
 * nombres de tecnología que no añaden nada a quien ya ha leído la lede, y
 * anunciarlas una a una sería ruido.
 */

/**
 * Los nombres de los adaptadores (HTTP, Kafka, S3…) no se traducen: son
 * nombres propios de tecnología y se escriben igual en los dos idiomas.
 */
const copy = {
  en: {
    core: "Core",
    domain: "Domain",
    noDeps: "no dependencies",
    caption: "ports and adapters · the domain knows nothing about infrastructure",
  },
  es: {
    core: "Núcleo",
    domain: "Dominio",
    noDeps: "sin dependencias",
    caption: "puertos y adaptadores · el dominio no sabe de infraestructura",
  },
} as const;

type ChipProps = {
  label: string;
  icon: React.ReactNode;
  className: string;
};

function Chip({ label, icon, className }: ChipProps) {
  return (
    <div className={`absolute flex items-center gap-2.5 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3.5 py-2 shadow-[var(--shadow-sm)] ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
        {icon}
      </svg>
      <span className="font-mono text-[13px] font-medium text-[var(--ink)]">{label}</span>
    </div>
  );
}

export default function HeroArt() {
  const { lang } = useLang();
  const tx = copy[lang];

  return (
    <div className="relative aspect-square w-full max-w-[500px]" aria-hidden>
      <svg viewBox="0 0 470 470" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="hero-hex" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f9b62c" />
            <stop offset="45%" stopColor="#fb7a1e" />
            <stop offset="100%" stopColor="#ee4136" />
          </linearGradient>
        </defs>

        {/* El anillo exterior es la frontera de la aplicación: discontinua
            porque no es código, es el contrato con el mundo. */}
        <path d="M235 96 L355 165 L355 305 L235 374 L115 305 L115 165 Z" fill="none" stroke="var(--hairline)" strokeWidth="1.5" strokeDasharray="5 7" />
        <path d="M235 140 L317 187 L317 283 L235 330 L153 283 L153 187 Z" fill="var(--surface)" stroke="url(#hero-hex)" strokeWidth="2.5" strokeLinejoin="round" />

        <g stroke="var(--hairline)" strokeWidth="1.5">
          <path d="M235 96 L235 40" />
          <path d="M355 165 L410 133" />
          <path d="M355 305 L410 337" />
          <path d="M115 305 L60 337" />
          <path d="M115 165 L60 133" />
        </g>

        {/* Los puertos, donde la línea del adaptador toca la frontera. */}
        <g fill="var(--orange)">
          <rect x="228" y="89" width="14" height="14" rx="3.5" />
          <rect x="348" y="158" width="14" height="14" rx="3.5" />
          <rect x="348" y="298" width="14" height="14" rx="3.5" />
          <rect x="108" y="298" width="14" height="14" rx="3.5" />
          <rect x="108" y="158" width="14" height="14" rx="3.5" />
        </g>
      </svg>

      <div className="absolute left-1/2 top-1/2 w-[150px] -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{tx.core}</div>
        <div className="mt-1.5 text-2xl font-extrabold tracking-[var(--tracking-tight)] text-[var(--ink)]">{tx.domain}</div>
        <div className="mt-2 font-mono text-xs text-[var(--body)]">{tx.noDeps}</div>
      </div>

      <Chip
        label="HTTP"
        className="left-1/2 top-0 -translate-x-1/2"
        icon={<><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9h18M7 14h6" /></>}
      />
      <Chip
        label="Kafka"
        className="right-0 top-[22%]"
        icon={<><path d="M4 12h6M14 6h6M14 18h6" /><circle cx="12" cy="12" r="2" /><path d="M10 12a4 4 0 0 1 4-6M10 12a4 4 0 0 0 4 6" /></>}
      />
      <Chip
        label="PostgreSQL"
        className="bottom-[22%] right-0"
        icon={<><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>}
      />
      <Chip
        label="S3"
        className="bottom-[22%] left-0"
        icon={<><path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></>}
      />
      <Chip
        label="gRPC"
        className="left-0 top-[22%]"
        icon={<><path d="M4 7h7M4 12h5M4 17h7" /><path d="M15 5l5 7-5 7" /></>}
      />

      <p className="absolute inset-x-0 bottom-0 text-center font-mono text-[12.5px] text-[var(--muted)]">
        {tx.caption}
      </p>
    </div>
  );
}
