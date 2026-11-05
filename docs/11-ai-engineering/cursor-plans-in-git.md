---
id: DOC-AI-004
title: Cursor plans в git
type: ai-policy
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-10-30'
owner: docs-engineering
related:
  - DOC-AI-001
  - DOC-ADR-README-001
---
# Cursor plans в git

## Политика

> **certainty:** fact
>
> Существенные **согласованные** планы работ сохраняются в репозитории под **`.cursor/plans/`**, чтобы история решений была доступна команде.

## Как сохранять в Cursor

> **certainty:** fact
>
> В Cursor существует действие **Save to Workspace** для плана. Это не обещание, что сохранение всегда происходит автоматически по умолчанию.

> **certainty:** assumption
>
> В **WSL** иногда требуется **ручное копирование** файла плана в `.cursor/plans/`, если UI/путь workspace не совпал с ожидаемым.

## Чего не делать

> **certainty:** fact
>
> - Не дублировать содержимое ADR, OpenSpec или roadmap внутри plan-файла — **ссылаться**.
> - Не обещать «автоматический default» сохранения всех черновиков планов в git.
> - Не класть секреты в планы.

## Связь с docs

План в `.cursor/plans/` — рабочий артефакт согласования. Нормативные решения после принятия — ADR / OpenSpec / product docs.
