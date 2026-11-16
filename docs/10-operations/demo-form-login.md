---
id: DOC-OPS-FORM-LOGIN-001
title: Demo form login (DX)
type: operations
status: draft
version: '0.1.2'
created: '2026-11-07'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-ADR-0007
  - DOC-OPS-003
---

# Demo form login (DX + server compose)

> **certainty:** hypothesis
>
> Локальный DX (`npm run dev`, `http://localhost:3080`) и server Compose используют Nest session cookie + Next `/login`. Living apply OpenSpec — после human review.

## Credentials (gitignored)

### DX (`npm run dev:auth:ensure`)

- `.env.dev-auth` — `COOKIE_SECURE`, `LOGIN_USERNAME`, `SESSION_SECRET`, `PUBLIC_ORIGIN`
- `.dev-login-password` — plaintext (chmod 600); report only the path
- `.dev-login-password-hash` — bcrypt; mounted into api as `LOGIN_PASSWORD_HASH_FILE`
- Запрошенные локальные demo credentials: **username `admin` / password `admin`** (файлы gitignored; не коммитить). Смена на уже существующей установке — править эти файлы + recreate сервиса `api`, не весь стек.

### Server (`npm run server:auth:ensure` перед `server:up`)

- `.env.server-auth` — отдельно от DX; `COOKIE_SECURE` = true только если `PUBLIC_ORIGIN` https
- `.server-login-password` / `.server-login-password-hash` — не переиспользовать DX secrets
- Web: `API_INTERNAL_URL=http://api:3000` (middleware → Nest)
- Server Compose credentials **не** автоматически `admin`/`admin` — отдельный bootstrap.

Bootstrap idempotent; существующие файлы не перезаписывает (для смены DX credentials править файлы вручную или удалить и пересоздать).

## Behaviour

- Unchecked remember: session cookie без Max-Age, server exp 8h
- Checked: Max-Age 2592000 + exp 30d
- Cache-Control `private, no-store` на auth + `/v1` + gated pages
- Caddy strips client `X-Middleware-Subrequest` before Next (dev + server)
- `/docs/` и `/backend/health` / OpenAPI не гейтятся page-middleware
- DX loopback: если `PUBLIC_ORIGIN` = `http://localhost:3080`, браузерный Origin `http://127.0.0.1:3080` (и наоборот) допускается при том же protocol+port; чужие host/port и prod non-loopback — строгое совпадение. Cookie остаётся host-bound (localhost ≠ 127 session).

## Related

- ADR-0007 draft; OpenSpec change `demo-v1-form-login` (не apply без human)
- [server-compose-demo](./server-compose-demo.md)
