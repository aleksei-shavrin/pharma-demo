---
id: DOC-DEL-001
title: "Quality gates"
type: delivery
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-QA-001
  - DOC-QA-002
  - DOC-AI-001
---

# Quality gates

Черновая политика ворот. Enforcement в приложении/CI — **FUTURE**, пока фиксируем ожидания.

## Gate G0 — Documentation

> **certainty:** hypothesis
>
> - substantive MD с корректным frontmatter;
> - certainty-блоки там, где утверждения неоднородны;
> - нет секретов в docs;
> - AI не выставил `approved` самостоятельно.

## Gate G1 — Change clarity

> **certainty:** hypothesis
>
> - для существенных изменений есть OpenSpec и/или ADR по теме;
> - нет дублирования «трёх истин» без ссылок.

## Gate G2 — Tests (когда появится код)

> **certainty:** hypothesis
>
> - bugfix: сначала красный тест (см. [test-first-bugfix](../11-ai-engineering/test-first-bugfix.md));
> - покрытие по [coverage-policy](../08-quality/coverage-policy.md) — цель, не автомагия W1.

## Gate G3 — Architecture fitness (FUTURE)

> **certainty:** hypothesis
>
> - dependency-cruiser / architecture tests зелёные, когда подключены ([architecture-tests](../08-quality/architecture-tests.md)).

## Применение сейчас (W1)

> **certainty:** fact
>
> Для волны W1-Docs применим содержательно **G0** (фундамент docs). G1–G3 ждут кода и CI.
