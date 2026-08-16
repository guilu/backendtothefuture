import { readFileSync, writeFileSync } from 'node:fs';

const A = '/Users/diegobarrioh/code/forma/frontend/src/assets/anatomy/male/front';
const OUT = '/private/tmp/claude-501/-Users-diegobarrioh-code-backendtothefuture-com/8334927d-5147-4734-8e39-2e94324e49e0/scratchpad/art2.html';

const b64 = (p, mime) =>
  `data:${mime};base64,${readFileSync(p).toString('base64')}`;

const silhouette = b64(`${A}/silhouette.webp`, 'image/webp');
const mask = (name) => b64(`${A}/${name}.svg`, 'image/svg+xml');

/* Two emphasis levels, exactly as the card renders them. */
const PRIMARY = ['ABS', 'QUADRICEPS'];
const SECONDARY = ['OBLIQUES', 'ADDUCTORS'];

const layer = (name, cls) =>
  `<div class="muscle ${cls}" style="-webkit-mask-image:url('${mask(name)}');mask-image:url('${mask(name)}')"></div>`;

const muscles =
  PRIMARY.map((m) => layer(m, 'is-primary')).join('\n') +
  '\n' +
  SECONDARY.map((m) => layer(m, 'is-secondary')).join('\n');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  :root {
    /* Forma's own tokens — the post's subject decides the palette. */
    --accent: #63e662;
    --ramp-from: #0b755f;
    --ramp-to: #85f55c;
    /* The series anchor, kept as a warm haze at the edge. */
    --ember: #fb7a1e;
  }
  html, body { margin: 0; background: #05070a; }
  .stage { position: relative; overflow: hidden; background:
    radial-gradient(120% 100% at 78% 18%, #12181f 0%, #0a0e13 46%, #05070a 100%); }

  /* Cool counterweight, low and opposite the figure. */
  .cool, .warm { position: absolute; border-radius: 50%; pointer-events: none; }
  .cool { background: radial-gradient(circle,
      rgba(14,120,110,.40) 0%, rgba(12,90,95,.13) 42%, rgba(11,117,95,0) 70%); }
  .warm { background: radial-gradient(circle,
      rgba(251,122,30,.22) 0%, rgba(238,65,54,.07) 45%, rgba(238,65,54,0) 72%); }

  .body { position: absolute; }
  .body > * {
    position: absolute; inset: 0;
    -webkit-mask-size: 100% 100%; mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  }

  /* The silhouette is a mask too, so its colour is ours to choose: a dark
     slate with light falling from above, not the grey the file was drawn in. */
  .shell {
    background: linear-gradient(168deg, #1b222b 0%, #12171e 40%, #090c11 100%);
  }
  .shellGlow {
    background: linear-gradient(163deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 38%);
  }

  /* Deep enough that the glow reads as light, not as fill. */
  .muscle.is-primary {
    background: linear-gradient(172deg, var(--ramp-to) 0%, var(--accent) 52%, #1f9a63 100%);
    opacity: .95;
    filter: drop-shadow(0 0 22px rgba(99,230,98,.5));
  }
  .muscle.is-secondary {
    background: var(--ramp-from);
    opacity: .34;
  }

  /* A cold rim down one side, so the dark body has form instead of being a
     hole cut in the background. */
  .rim {
    background: linear-gradient(102deg,
      rgba(150,200,215,.30) 0%, rgba(150,200,215,0) 16%);
  }

  /* Grain kills the banding in the big gradients. */
  .grain { position: absolute; inset: 0; opacity: .05; pointer-events: none;
    filter: url(#g); }
  .vign { position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(58% 52% at 62% 48%, rgba(0,0,0,0) 24%, rgba(0,0,0,.55) 72%, rgba(0,0,0,.88) 100%); }
</style></head>
<body>
<div class="stage" id="stage">
  <div class="cool" id="cool"></div>
  <div class="warm" id="warm"></div>
  <div class="body" id="body">
    <div class="shell"     style="-webkit-mask-image:url('${silhouette}');mask-image:url('${silhouette}')"></div>
    <div class="shellGlow" style="-webkit-mask-image:url('${silhouette}');mask-image:url('${silhouette}')"></div>
    <div class="rim"       style="-webkit-mask-image:url('${silhouette}');mask-image:url('${silhouette}')"></div>
${muscles}
  </div>
  <div class="vign"></div>
  <svg width="0" height="0"><filter id="g">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter></svg>
  <div class="grain"></div>
</div>
<script>
const P = new URLSearchParams(location.search);
const W = +P.get('w'), H = +P.get('h'), MODE = P.get('mode');
const S = document.getElementById('stage');
S.style.width = W + 'px'; S.style.height = H + 'px';

const RATIO = 854 / 1840;
const body = document.getElementById('body');

if (MODE === 'cover') {
  /* The figure is scenery, small in a wide dark field; the lit muscles are the
     only thing that has to read at thumbnail size. Head and feet fall just
     outside the frame so it is a body, not a diagram of one. */
  const bh = H * 1.34, bw = bh * RATIO;
  body.style.height = bh + 'px';
  body.style.width = bw + 'px';
  body.style.left = (W * 0.665 - bw / 2) + 'px';
  body.style.top = (-H * 0.15) + 'px';
} else {
  /* Portrait restages rather than crops: the whole figure, held small against a
     tall empty field. */
  const bh = H * 0.72, bw = bh * RATIO;
  body.style.height = bh + 'px';
  body.style.width = bw + 'px';
  body.style.left = (W * 0.52 - bw / 2) + 'px';
  body.style.top = (H * 0.17) + 'px';
}

const cool = document.getElementById('cool');
const warm = document.getElementById('warm');
const cd = (MODE === 'cover' ? H : W) * 1.7;
cool.style.width = cool.style.height = cd + 'px';
cool.style.left = (W * (MODE === 'cover' ? 0.24 : 0.30) - cd / 2) + 'px';
cool.style.top = (H * (MODE === 'cover' ? 0.74 : 0.80) - cd / 2) + 'px';

const wd = (MODE === 'cover' ? H : W) * 1.15;
warm.style.width = warm.style.height = wd + 'px';
warm.style.left = (W - wd * 0.42) + 'px';
warm.style.top = (-wd * 0.40) + 'px';
</script>
</body></html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(0) + 'kb');
