#!/usr/bin/env bash
# Ensure pharma-demo-api-auth Secret exists (LOGIN_* + SESSION_SECRET).
# Never prints secret values. Default demo password is "admin" (bcrypt below)
# unless PHARMA_LOGIN_* / PHARMA_SESSION_SECRET are set in CI.
set -euo pipefail

NAMESPACE="${K8S_NAMESPACE:-pharma}"
SECRET_NAME=pharma-demo-api-auth

USERNAME="${PHARMA_LOGIN_USERNAME:-admin}"
# bcryptjs hash of plaintext "admin" (cost 10). Override via PHARMA_LOGIN_PASSWORD_HASH.
DEFAULT_HASH='$2b$10$VuVW4hUfPB1QEC7E5PDG..phsTGPvlbKstaYXBrULPMZ2NMHTYCoq'
PASSWORD_HASH="${PHARMA_LOGIN_PASSWORD_HASH:-$DEFAULT_HASH}"

if [[ -n "${PHARMA_SESSION_SECRET:-}" ]]; then
  SESSION_SECRET="$PHARMA_SESSION_SECRET"
elif kubectl -n "$NAMESPACE" get secret "$SECRET_NAME" >/dev/null 2>&1; then
  # Keep existing session secret across deploys when CI does not override.
  SESSION_SECRET="$(
    kubectl -n "$NAMESPACE" get secret "$SECRET_NAME" \
      -o jsonpath='{.data.SESSION_SECRET}' | base64 -d
  )"
else
  SESSION_SECRET="$(openssl rand -hex 32)"
fi

kubectl -n "$NAMESPACE" create secret generic "$SECRET_NAME" \
  --from-literal=LOGIN_USERNAME="$USERNAME" \
  --from-literal=LOGIN_PASSWORD_HASH="$PASSWORD_HASH" \
  --from-literal=SESSION_SECRET="$SESSION_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "apply-api-auth-secret: OK ($SECRET_NAME in $NAMESPACE; username key set, values not printed)"
