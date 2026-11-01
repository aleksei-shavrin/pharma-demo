#!/bin/sh
set -eu
# Named volume for node_modules starts empty; install once, then reuse.
if [ ! -x node_modules/.bin/next ]; then
  echo "[web-dev] installing dependencies (npm ci)…"
  npm ci
fi
exec "$@"
