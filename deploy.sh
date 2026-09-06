#!/bin/bash
set -e

# ─── Config ───────────────────────────────────────────────────
PI_HOST="pi@red.local"
PI_PATH="/var/www/backendtothefuture.com/html"
SSH_KEY="$HOME/.ssh/pi_deploy_key"
UPSTREAM_REMOTE="origin"
UPSTREAM_BRANCH="master"
# ──────────────────────────────────────────────────────────────

FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

# ─── Guard: never deploy a tree that is behind the remote ─────
#
# The rsync below runs with `--delete`, so whatever this machine builds becomes
# the whole site. That makes "my checkout is one commit stale" a publishing
# incident rather than a git inconvenience: on 2026-09-06 a deploy from a local
# master that predated an already-merged PR silently removed that PR's analytics
# from production. Nothing failed. The build succeeded, the rsync succeeded, the
# pages returned 200 — the site was simply missing work that was already on
# origin.
#
# So the check runs here, before `npm run build`, because the whole point is to
# fail before spending two minutes producing an artefact that must not ship.
#
# It fails closed. If the remote cannot be reached we do not know whether this
# tree is current, and "unknown" is not "fine" — that assumption is the one that
# caused the incident. `--force` is the deliberate way past it, for deploying
# offline or from a branch on purpose.
if [ "$FORCE" -eq 1 ]; then
  echo "⚠ --force: skipping the remote-sync check. You own what ships."
else
  echo "▶ Checking this tree against ${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}..."

  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "✗ Not a git repository, so the deploy cannot be verified as current." >&2
    echo "  Re-run with --force if you really mean to publish this directory." >&2
    exit 1
  fi

  if ! git fetch --quiet "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH" 2>/dev/null; then
    echo "✗ Could not reach ${UPSTREAM_REMOTE}; cannot tell whether this tree is current." >&2
    echo "  Re-run with --force to deploy anyway." >&2
    exit 1
  fi

  # HEAD..upstream is "commits the remote has that we do not". Any of them would
  # be erased from the live site by the --delete rsync.
  BEHIND=$(git rev-list --count "HEAD..${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}")
  if [ "$BEHIND" -gt 0 ]; then
    echo "✗ This tree is behind ${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH} by ${BEHIND} commit(s)." >&2
    echo "  Deploying now would delete the following from production:" >&2
    git log --oneline --no-decorate --no-color "HEAD..${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}" | sed 's/^/    /' >&2
    echo "" >&2
    echo "  Fix: git pull --ff-only ${UPSTREAM_REMOTE} ${UPSTREAM_BRANCH}" >&2
    echo "  Or:  ./deploy.sh --force   (only if you mean to publish without them)" >&2
    exit 1
  fi

  # Uncommitted work is not blocked: publishing a draft before committing it is
  # a normal thing to do here. It is worth naming, though, because it is the
  # difference between what is live and what anyone else can reproduce from git.
  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "⚠ Working tree has uncommitted changes; they will go live but are not in git."
  fi

  echo "✓ Up to date with ${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}."
fi
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
