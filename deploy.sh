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

# `.DS_Store` is a Finder directory index and it was being served publicly
# (GET /.DS_Store → 200). It leaks the names of every file in the folder,
# including drafts and screenshots that are not linked from anywhere.
# .gitignore does not help here: that rule talks to git, not to rsync.
#
# `--delete-excluded` is load-bearing. Without it rsync *protects* excluded
# files on the receiver, so the copies already uploaded would keep being served
# forever. Note the flag means "delete on the remote whatever I exclude" — only
# add an exclude here for something that must NOT survive on the server.
echo "▶ Deploying to ${PI_HOST}:${PI_PATH}..."
rsync -avz --delete --exclude='.DS_Store' --delete-excluded -e "ssh -i ${SSH_KEY}" out/ "${PI_HOST}:${PI_PATH}"

echo "✓ Deploy complete → https://backendtothefuture.com"
