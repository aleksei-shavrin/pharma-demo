## Why

Demo v1 нужен тот же UX form-login / logout, что на docs-портале: единый demo-логин, HttpOnly cookie, защита страниц и API без отдельного auth-сервиса и без Caddy forward_auth.

Явное требование пользователя 2026-11-07 разрешает **demo form gate** вопреки прежнему «no auth» в R2 delta (IAM/multi-tenant по-прежнему out of scope).

## What Changes

- Nest `AuthModule`: single-user bcrypt, AES-GCM session cookie, login/logout/session, SessionGuard на `/v1` data.
- Next `/login` UI + middleware verify через Nest; logout icon в top bar (POST).
- DX secrets gitignored; same-origin Caddy `:3080` / `/backend`.
- OpenSpec capability `demo-form-login` + ADR-0007 draft.

## Capabilities

### New Capabilities

- `demo-form-login`: demo session gate for app pages and narrative API.

### Modified Capabilities

- (none living applied in this wave — apply/archive after human review)

## Impact

- `apps/api` auth + guard; `apps/web` login/middleware/shell logout/`api-client` credentials.
- Compose/env for secrets; docs/ADR draft.
- Out of scope: Keycloak, design system, PostgreSQL users, `/docs` gate, Caddy forward_auth, schedule feature changes.
- Living specs apply/archive — **human** only.
