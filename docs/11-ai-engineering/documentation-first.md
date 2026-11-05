---
id: DOC-AI-002
title: Documentation-first (документация прежде кода)
type: ai-policy
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-AI-001
  - DOC-STD-001
---
# Documentation-first

## Политика

> **certainty:** fact
>
> Существенные изменения поведения, контрактов или архитектуры сопровождаются обновлением docs и/или ADR/OpenSpec **до или вместе** с кодом — не «потом, если вспомним».

## Практика для агентов

1. Найти канонический документ (product / ADR / REQ).
2. Обновить или создать draft со корректной certainty.
3. Затем менять код (когда волна это допускает).
4. В handoff перечислить docs-артефакты.

## Исключения

> **certainty:** assumption
>
> Типографика/рефакторинг без смены поведения может обойтись без нового ADR; краткая заметка в PR/handoff всё же желательна.
