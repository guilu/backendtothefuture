#!/bin/bash
set -e

# ─── Config ───────────────────────────────────────────────────
PI_HOST="pi@raspberrypi.local"       # cambia por IP o hostname de tu Pi
PI_PATH="/var/www/backendtothefuture.com/html"
# ──────────────────────────────────────────────────────────────

echo "▶ Building..."
npm run build

echo "▶ Deploying to ${PI_HOST}:${PI_PATH}..."
rsync -avz --delete out/ "${PI_HOST}:${PI_PATH}"

echo "✓ Deploy complete → https://backendtothefuture.com"
