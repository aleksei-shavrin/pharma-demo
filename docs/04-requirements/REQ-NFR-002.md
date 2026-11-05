---
id: REQ-NFR-002
title: 'REQ-NFR-002: Persistence port для mock-адаптера'
type: nfr
status: draft
version: 0.2.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-004
  - DOC-PROD-003
---
# REQ-NFR-002: Persistence port для mock-адаптера

## Категория

maintainability

## Формулировка

Backend Demo v1 shall хранить narrative-данные через **persistence adapter interface** (mock-adapter в Demo v1). Последующая замена mock-adapter на PostgreSQL-adapter должна **сохранять существующие доменные и HTTP API-контракты Demo v1** без необходимости менять FE и HTTP API. Наличие port само по себе **не** автоматически гарантирует совместимость — требуются контрактные проверки / design review при переходе (DOC-PROD-004). PostgreSQL **не** входит в Demo v1.

## Метрика / порог

| Метрика | Порог | Метод |
|---------|-------|-------|
| Domain/API independence from storage | Mock adapter behind port; FE/HTTP API unchanged upon adapter swap intent | Design review vs persistence-transition; contract checks at transition |

## Вне scope этого NFR

Не требует: PostgreSQL в Demo v1, authentication, multi-tenancy, production-grade security; не обещает automatic cutover без тестов.

## Certainty

> **certainty:** fact
>
> Направление зафиксировано в DOC-PROD-003 / DOC-PROD-004; реализация — later apps wave.
