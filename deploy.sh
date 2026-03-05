#!/bin/bash
set -e

# ─── Config ───────────────────────────────────────────────────
PI_HOST="pi@red.local"
PI_PATH="/var/www/backendtothefuture.com/html"
SSH_KEY="$HOME/.ssh/pi_deploy_key"
# ──────────────────────────────────────────────────────────────

echo "▶ Building..."
npm run build

echo "▶ Deploying to ${PI_HOST}:${PI_PATH}..."
rsync -avz --delete -e "ssh -i ${SSH_KEY}" out/ "${PI_HOST}:${PI_PATH}"

echo "✓ Deploy complete → https://backendtothefuture.com"
