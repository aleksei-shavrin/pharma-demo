---
id: DOC-ADR-0007
title: 'ADR-0007: Demo form login (Nest session + Next UI)'
type: adr
status: draft
version: '0.1.0'
created: '2026-11-07'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-ADR-0003
  - DOC-ADR-0005
---

# ADR-0007: Demo form login (Nest session + Next UI)

- **Статус решения:** proposed
- **Дата:** 2026-11-07
- **Документ `status`:** draft (не human-approved)

## Контекст

Нужна demo-форма входа/выхода как у docs-портала, без отдельного auth-сервиса и без Caddy `forward_auth`. Стек: Next FE + Nest API, same-origin Caddy (`/backend`).

Прежний R2 текст «no auth» относился к IAM/enterprise; явное требование 2026-11-07 разрешает **demo form gate**.

## Решение

> **certainty:** hypothesis
>
> 1. Nest владеет bcrypt verify + AES-256-GCM session cookie и SessionGuard на narrative `/v1`.
> 2. Next рендерит `/login` и middleware вызывает Nest `GET /v1/auth/session` (fail-closed).
> 3. Cookie: HttpOnly, SameSite=Lax; session 8h / remember 30d; Secure только HTTPS.
> 4. Secrets — gitignored файлы + mount hash; не в `NEXT_PUBLIC_*`.
> 5. `/docs` и OpenAPI/health остаются по существующим контрактам вне app page gate.

## Последствия

### Положительные

- Один origin, один cookie, серверная защита API (401) и страниц.
- Паритет UX с docs без копирования edge login service.

### Отрицательные / риски

- Demo single-user не заменяет IAM.
- Middleware зависит от доступности Nest (fail-closed).

## Alternatives considered

- Caddy forward_auth + отдельный Next login — отвергнуто (лишняя платформа для уже существующего Nest).
- JWT в localStorage — отвергнуто (XSS surface; референс cookie).
