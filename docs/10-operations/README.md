---
id: DOC-OPS-README-001
title: Эксплуатация
type: index
status: draft
version: 0.1.1
created: '2026-10-30'
updated: '2026-11-05'
owner: docs-engineering
related:
  - DOC-PORTAL-004
  - DOC-ADR-0003
  - DOC-ADR-0005
  - DOC-OPS-002
  - DOC-OPS-003
---
# 10-operations

Операционные runbook'и, мониторинг, бэкапы, инциденты.

## Правила

- Плейсхолдеры вместо секретов.
- Локальный dev proxy/URL — см. [ADR-0003](../06-architecture/decisions/0003-local-dev-urls-and-proxy.md); server/IP:port — [ADR-0005](../06-architecture/decisions/0005-server-single-origin-compose.md); prod ACL — open question в [access-and-security](../00-portal/access-and-security.md).

## Содержимое

| Документ | Назначение |
|----------|------------|
| [Local development and production-like Demo](./local-dev-and-demo.md) | `npm run dev` vs `docker compose --profile app` |
| [Server Compose Demo](./server-compose-demo.md) | Single-origin `/backend` + `/portal` (`npm run server:up`) |
