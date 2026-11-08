## Context

Pharma Demo DX: Next + Nest behind Caddy same-origin `http://localhost:3080` (`/backend` → Nest). Auth отсутствовал. Референс поведения — `docs-portal` form login (T10), но **не** копируем отдельный Next login service / forward_auth.

## Goals / Non-Goals

- Goals: demo single-user form login; HttpOnly cookie; page+API protection; remember 8h session vs 30d; logout POST; DX secrets local.
- Non-Goals: IAM, roles, multi-tenant, Keycloak, DS package, gating `/docs`, live k3s deploy.

## Decisions

1. **Nest owns crypto/session** — AES-256-GCM seal/open; bcrypt verify; cookie `pharma_session` / `__Host-pharma_session`.
2. **Next owns UI + middleware** — middleware calls Nest `GET /v1/auth/session` with Cookie; Nest down → fail-closed (treat as unauthenticated).
3. **API 401** for protected routes without session — never HTML redirect from API.
4. **Public exceptions:** `POST /v1/auth/login`, `POST /v1/auth/logout` (Origin check, idempotent), `GET /v1/auth/session` (204/401), existing `/health` + OpenAPI `/api`; `/docs` out of app scope.
5. **Origin:** compare to explicit `PUBLIC_ORIGIN`/`WEB_ORIGIN` — **protocol + host + port** must match. DX-only exception: when configured `PUBLIC_ORIGIN` host is loopback (`localhost` or `127.0.0.1`), accept the peer loopback host (`localhost`↔`127.0.0.1`) with the **same** protocol and port. Non-loopback (prod) stays strict single-origin. Missing/null Origin and foreign hosts/ports still rejected; Origin check is never disabled.
6. **Rate limit:** bucket from proxy-set `X-Real-IP` only (ignore client XFF).
7. **Return path:** sanitize internal path+query; `encodeURI` on Location; reject open redirects.
8. **Secrets:** hash file mount (no Compose `$` interpolation); never `NEXT_PUBLIC_*` secrets.

## Risks / Trade-offs

- Global SessionGuard vs per-controller — guard with allowlist; OpenAPI/health stay open.
- R2 «no auth» text — superseded for *demo form gate* by this change + user authorization; full IAM still forbidden.

## Migration

- FE `fetch` → `credentials: 'include'` (pages are client components).
- E2E: login helper before narrative flows (no global auth disable).
