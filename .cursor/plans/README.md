# Cursor plans в репозитории

## Политика

Существенные **согласованные** планы работ хранятся в **`.cursor/plans/`**, чтобы команда видела историю решений в Git.

Нормативный текст: [`docs/11-ai-engineering/cursor-plans-in-git.md`](../../docs/11-ai-engineering/cursor-plans-in-git.md).

## Как сохранить план

1. В Cursor: действие **Save to Workspace** (перенос из `~/.cursor/plans/` → `.cursor/plans/`).
2. На **WSL / remote** меню может отсутствовать — допустимо **вручную** скопировать `.md` план в этот каталог.
3. Автоматического default «все черновики в git» **нет**; **не** менять global Cursor settings ради этого.

## Чего не делать

- Не дублировать содержимое ADR, OpenSpec или roadmap — ссылаться.
- Не класть секреты.
- Не сохранять сюда мелкие одноразовые черновики без согласования.

## Текущие планы

| Файл | Назначение |
|---|---|
| [docs-engineering-system.md](./docs-engineering-system.md) | Этап Docs Engineering System (OpenSpec + Docusaurus + Compose) |
| [openspec-demo-v1-stage1.md](./openspec-demo-v1-stage1.md) | Stage 1: OpenSpec formalization Demo v1 Must (C-01…C-05) |
| [ux-ui-demo-v1.md](./ux-ui-demo-v1.md) | UX/UI Demo v1: Discovery D1–D12 + Proposal/Handoff (этап H) |
