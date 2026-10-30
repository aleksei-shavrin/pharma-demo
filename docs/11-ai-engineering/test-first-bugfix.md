---
id: DOC-AI-003
title: "Test-first bugfix"
type: ai-policy
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-TPL-BUGFIX-001
  - DOC-QA-001
  - DOC-AI-001
---

# Test-first bugfix

## Политика

> **certainty:** fact
>
> Исправление бага: сначала автоматизированный тест, который **падает** на текущем коде; затем минимальный фикс; затем зелёный тест.

## Шаги

1. Воспроизвести симптом.
2. Написать/дописать тест (шаблон [bugfix-test-first](../_templates/bugfix-test-first.md)).
3. Убедиться в FAIL.
4. Исправить код.
5. PASS + регрессия.

## Когда кода ещё нет

> **certainty:** assumption
>
> До появления тестового контура фиксировать баг и ожидаемый тест-кейс в docs/handoff — но не объявлять bugfix «закрытым» без красного→зелёного цикла, когда контур уже доступен.
