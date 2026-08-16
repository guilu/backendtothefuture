# Building the post's art in the subject's palette

Two routes, both in the subject project's accent. Try the generative one first —
it was what shipped for 2026-08-16 — and reach for the asset route when the
week's own artwork is the point.

**The trap both routes fall into: literalness.** The first cover for that post
put Forma's silhouette in the frame with its muscles lit; it was legible, it was
on-topic, and it read as a fitness-app splash screen rather than an article. The
verdict from the author was "the accent works, the image is too simple". A cover
earns attention through a *metaphor* for the week, rendered in the subject's
colour — not through a picture of the feature.

## Route A — generative, abstract (preferred)

Take the week's throughline and find the geometric fact underneath it. For a
week about lighting the right muscle group and deliberately leaving the rest
dark, that fact is **repetition with a single break in it**: a field of
identical dark fascicles, one contracted and lit.

Working recipe, in `scripts/art-fascicle-field.html`:

- 7–9 bundles laid along a tilted axis, each 9 strands.
- A strand is one cubic curve, ends pinned close together and control points
  thrown wide at mid-length — that is the spindle every muscle belly has.
- The lit bundle is **shorter and fatter** than its neighbours (contracted), and
  is the only one drawn sharp; the rest get a 1.5px blur so they sit back.
- Light lives in the belly and dies at the tendons: one vertical
  `linearGradient` per strand, transparent at both ends.
- Neighbour bundles fall off in opacity with distance from the lit one, and the
  vignette centres on the lit one, so the eye cannot wander.

Metaphors that did **not** work, and why, so they are not retried:

| Attempt | Failure |
|---|---|
| Concentric arcs (a rep on a long exposure) | reads as an aurora or a wifi glyph, not as effort |
| One tall fibre bundle alone | reads as a blade of grass |
| Dense fibre bundle (70+ strands) | fuses into a solid glowing leaf, blows out white |

## Route B — from the week's own assets

When the week shipped illustration assets — silhouettes, plates, icons, masks —
the cover can be made out of them, and is then made with the same technique the
post explains. Keep them **small in a large dark field**: scenery, not subject.

## The technique

The asset supplies the **shape**; a CSS token supplies the **colour**. Never
place the asset as an `<img>` — you inherit whatever colour it was authored in
and lose both the dark treatment and the accent.

```css
.layer {
  position: absolute; inset: 0;
  -webkit-mask-image: url('data:image/svg+xml;base64,…');
          mask-image: url('data:image/svg+xml;base64,…');
  -webkit-mask-size: 100% 100%; mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
}
```

Stack the same mask three times over three different blocks and one asset gives
you a whole lighting model:

| Layer | Block behind the mask | Reads as |
|---|---|---|
| `shell` | `linear-gradient(168deg, #1b222b, #12171e 40%, #090c11)` | the form, in shadow |
| `shellGlow` | white at ~10 % fading out by 38 % | light falling from above |
| `rim` | a cold blue-grey at ~30 %, fading out by 16 % across | edge light, so the form isn't a hole cut in the ground |

Then the accent layers on top, one per lit region, using the subject project's
tokens — a bright ramp at ~95 % opacity for primary, the dark end of the ramp at
~34 % for secondary. Two emphasis levels are two opacities, not two assets.

The silhouette and its per-region masks must share a viewBox (Forma's are all
854×1840), or nothing lines up.

## Composition

- **Cover (1200×630):** figure height ≈ 1.3× the frame, positioned around 66 %
  of the width, top ≈ −15 % — head and feet fall outside the frame. Cool mass
  low-left at ~24 % width, warm haze bleeding in from the top-right corner.
- **Thumb (800×1200):** restage, don't crop. Whole figure at ≈ 0.72× frame
  height, roughly centred, held in a tall empty field.
- Strong vignette: `radial-gradient(58% 52% at 62% 48%, transparent 24%,
  rgba(0,0,0,.55) 72%, rgba(0,0,0,.88) 100%)`.
- Grain at ~5 % (`feTurbulence` + desaturate) to kill gradient banding.

The failure mode to watch for: scale the asset up until it fills the frame and
the image stops being editorial art and becomes a product splash. If in doubt,
pull the camera back.

## Rendering

Two gotchas, both of which cost a cycle if you rediscover them:

1. **Embed the assets as base64 data URIs.** A `file://` page loading `file://`
   subresources is not reliable in Chromium; generate the HTML with a small
   Node script that reads each asset and inlines it.
2. **Playwright resolves imports relative to the script file, not the cwd.** The
   render script must be *copied into* a directory that has `@playwright/test`
   installed (`forma/frontend` works) and deleted afterwards. Running it from
   the blog repo with `cd` alone fails with `ERR_MODULE_NOT_FOUND`.

```bash
node build-art.mjs                        # writes art.html with inlined assets
cp render.mjs ~/code/forma/frontend/_render.mjs
(cd ~/code/forma/frontend && node _render.mjs)
rm -f ~/code/forma/frontend/_render.mjs
```

Render at `deviceScaleFactor: 2`, then:

```bash
cwebp -q 88 -resize 1200 630  art-cover.png -o public/blog/<slug>-cover.webp
cwebp -q 88 -resize 800 1200  art-thumb.png -o public/blog/<slug>-thumb.webp
sips -Z 1200 -s format jpeg -s formatOptions 86 art-cover.png \
     --out public/blog/<slug>-og.jpg
```
