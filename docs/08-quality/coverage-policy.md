---
id: DOC-QA-002
title: "Политика coverage"
type: quality
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-QA-001
---

# Политика coverage

## Цель

> **certainty:** hypothesis
>
> Целевой порог **80%** покрытия **отдельно** для FE и для BE (не одна усреднённая цифра на монорепо).

## Исключения (явные)

> **certainty:** hypothesis
>
> Не включать в знаменатель / исключать из gate (уточняется при подключении CI):
>
> - сгенерированный код (OpenAPI clients, если генерируется);
> - чисто презентационные story/fixture файлы без логики;
> - `main.ts` / bootstrap glue по согласованию;
> - типы-only файлы без runtime.
>
> Список excludes должен жить рядом с конфигом coverage, а сюда — ссылка и краткое резюме.

## Enforcement

> **certainty:** fact
>
> CI fail-on-threshold — **FUTURE**.
