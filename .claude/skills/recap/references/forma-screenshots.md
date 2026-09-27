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
- **Easier than a hand-written stub table: `FIXTURES=1 vite`** (`npm run
  dev:fixtures`) serves `e2e/apiFixtures.ts` from the dev server itself. The
  Playwright driver then only needs `page.route` for the handful of endpoints
  the post wants richer (`route.fetch()` + edit for a tweaked fixture,
  `route.continue()` for the rest). Meal types must be real enum values
  (`MID_MORNING`, not `MORNING_SNACK`) or the card prints the raw key.
- **The worktree's `node_modules` is a symlink, so its Vite cache is shared.**
  If a Vite from the main checkout is already running (check `lsof -iTCP:5173`)
  the worktree's server serves `504 Outdated Optimize Dep` and the page renders
  blank. Don't kill the user's server: run the worktree on another port with a
  wrapper config that sets its own `cacheDir` and adds the real
  `node_modules` path to `server.fs.allow` (otherwise fonts 403 through `/@fs/`).
