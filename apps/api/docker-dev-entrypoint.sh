#!/bin/sh
set -eu
if [ ! -x node_modules/.bin/nest ]; then
  echo "[api-dev] installing dependencies (npm ci)…"
  npm ci
fi
# Hash stays in mounted file (LOGIN_PASSWORD_HASH_FILE); never echo it.
if [ -n "${LOGIN_PASSWORD_HASH_FILE:-}" ] && [ ! -f "${LOGIN_PASSWORD_HASH_FILE}" ]; then
  echo "[api-dev] LOGIN_PASSWORD_HASH_FILE missing — auth will fail closed" >&2
fi
exec "$@"
