---
id: REQ-NFR-001
title: 'REQ-NFR-001: FE получает данные только через HTTP API'
type: nfr
status: draft
version: 0.1.1
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-003
---
# REQ-NFR-001: FE получает данные только через HTTP API

## Категория

architecture / maintainability

## Формулировка

Frontend Demo v1 shall получать бизнес-данные narrative исключительно через HTTP API backend; локальный mock-слой данных во FE как замена API запрещён.

## Метрика / порог

| Метрика | Порог | Метод |
|---------|-------|-------|
| FE data access path | Only API client | Architecture review / future architecture tests |

## Вне scope этого NFR

Не требует: PostgreSQL, authentication, multi-tenancy, production-grade security.

## Certainty

> **certainty:** fact
>
> Ограничение Demo v1 architecture (DOC-PROD-003).
