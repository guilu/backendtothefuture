#!/bin/bash
set -e

# ─── Config ───────────────────────────────────────────────────
PI_HOST="pi@red.local"
PI_PATH="/var/www/backendtothefuture.com/html"
SSH_KEY="$HOME/.ssh/pi_deploy_key"
# ──────────────────────────────────────────────────────────────

echo "▶ Building..."
npm run build

# Screenshots the freshly built /blog/ and /en/blog/ into public/og + out/og,
# named after the content hash the build already wrote into each page's
# og:image. Must run between the build and the rsync: before the build there is
# nothing to shoot, after the rsync the server would still be serving the
# previous thumbnail. See scripts/og-shot.mjs.
echo "▶ Refreshing Open Graph thumbnails..."
npm run og:shot

echo "▶ Deploying to ${PI_HOST}:${PI_PATH}..."
rsync -avz --delete -e "ssh -i ${SSH_KEY}" out/ "${PI_HOST}:${PI_PATH}"

echo "✓ Deploy complete → https://backendtothefuture.com"
