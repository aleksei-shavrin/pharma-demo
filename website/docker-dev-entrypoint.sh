#!/bin/sh
set -eu
if [ ! -x node_modules/.bin/docusaurus ]; then
  echo "[docs-dev] installing dependencies (npm ci)…"
  npm ci
fi
exec "$@"
