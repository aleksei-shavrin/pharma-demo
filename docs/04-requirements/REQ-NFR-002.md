---
id: REQ-NFR-002
title: "REQ-NFR-002: Persistence port for mock adapter"
type: nfr
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-004
  - DOC-PROD-003
---

# REQ-NFR-002: Persistence port for mock adapter

## Категория

maintainability

## Формулировка

Backend Demo v1 shall хранить narrative-данные через persistence adapter interface так, чтобы последующее подключение PostgreSQL не требовало изменения API-контрактов и FE.

## Метрика / порог

| Метрика | Порог | Метод |
|---------|-------|-------|
| Domain/API independence from storage | Mock adapter behind port | Design review vs persistence-transition |

## Вне scope этого NFR

Не требует: PostgreSQL в Demo v1, authentication, multi-tenancy, production-grade security.

## Certainty

> **certainty:** fact
>
> Направление зафиксировано в DOC-PROD-003 / DOC-PROD-004; реализация — later apps wave.
