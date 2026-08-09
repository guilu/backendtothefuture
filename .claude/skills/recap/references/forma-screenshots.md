# Capturing Forma screenshots for a recap

Shots are driven with Playwright against the Forma frontend running locally on a
**stubbed API** — no backend, no account, no real health data ends up in a
public post.

## Shoot the week's code, not today's

`main` moves on after the week ends, and another agent may have shipped since.
Check out the last commit of the week in a throwaway worktree so the screenshots
match the post:

```bash
cd ~/code/forma
git log main --oneline --grep="(#<last-PR-of-the-week>)" -1
git worktree add <scratchpad>/forma-week <that-commit>
ln -s ~/code/forma/frontend/node_modules <scratchpad>/forma-week/frontend/node_modules
cd <scratchpad>/forma-week/frontend && npm run dev     # Vite on 5173
```

Remove the worktree when done (`git worktree remove --force <path>`).

## The driver

A standalone `.mjs` inside `frontend/` (so `@playwright/test` resolves), modeled
on `frontend/e2e/stubApi.ts`: `page.route('**/api/v1/**')` fulfilling a
pathname→fixture table, 404 for anything unstubbed. Delete it after the run.

Three things that will otherwise cost an hour:

1. **Seed the CSRF cookie.** `api/client.ts` primes a token from
   `/actuator/health` before any POST and throws if the cookie never appears.
   Without `context.addCookies([{ name: 'XSRF-TOKEN', … }])` every POST-backed
   widget silently renders its empty state — including the plan generator's
   energy panel, whose whole point is the number it shows.
2. **Public pages need `/api/v1/auth/me` to 404/401.** Otherwise the landing and
   the funnel render the signed-in header, which is not what a visitor sees.
3. **Admin screens need `role: 'ADMIN'`** on that same endpoint to reach
   `/app/admin`.

`deviceScaleFactor: 2`, `colorScheme: 'dark'`, `locale: 'es-ES'`; mobile at 390
× 844 with `deviceScaleFactor: 3`.

## Output

```bash
cwebp -q 82 -crop 0 0 <w> <h> -resize 1440 0 shot.png -o public/img/forma-YYYY-MM-DD-<name>.webp
```

- App screenshots go in `public/img/` — `public/blog/` is for post
  cover/thumb/og.
- `-crop` trims the dead space below short pages (crop before resize).
- Mobile shots: resize to 780 and embed as raw
  `<img src="…" alt="…" width="390">`.
- Alt text is long and descriptive in this blog — describe the whole screen, not
  the feature name.

## Gotchas

- `src/pages/admin/thumbnail.ts` rejects any non-`http(s)` URL, so `data:` URI
  fixtures render nothing. Use fake `https://…` image URLs and intercept them
  with `page.route`.
- The blog has no `.blog-prose img` CSS; images stay in bounds only because
  Tailwind preflight sets `img { max-width: 100% }`.
