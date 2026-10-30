---
id: REQ-NFR-001
title: "REQ-NFR-001: FE consumes data only via HTTP API"
type: nfr
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-003
---

# REQ-NFR-001: FE consumes data only via HTTP API

## Категория

architecture / maintainability

## Формулировка

Frontend Demo v1 shall получать бизнес-данные narrative исключительно через HTTP API backend; локальный mock-слой данных во FE как замена API запрещён.

## Метрика / порог

| Метрика | Порог | Метод |
|---------|-------|-------|
| FE data access path | Only API client | Architecture review / future architecture tests |

## Certainty

> **certainty:** fact
>
> Ограничение Demo v1 architecture (DOC-PROD-003).
