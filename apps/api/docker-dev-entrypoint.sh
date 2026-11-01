#!/bin/sh
set -eu
if [ ! -x node_modules/.bin/nest ]; then
  echo "[api-dev] installing dependencies (npm ci)…"
  npm ci
fi
exec "$@"
