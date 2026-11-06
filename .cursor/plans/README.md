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
| [visual-direction-demo-v1.md](./visual-direction-demo-v1.md) | Visual Direction Demo v1: **COMPLETED**; VD-A approved baseline |
| [ui-design-spec-demo-v1.md](./ui-design-spec-demo-v1.md) | UI Design Spec **plan COMPLETED** (Iter 0–5); **pack APPROVED** (historical: Implementation was NOT STARTED at pack close) |
| [demo-v1-implementation.md](./demo-v1-implementation.md) | Demo v1 Implementation **I1–I8 APPROVED+committed**; plan ends at I8; BA-OQ-006 / D12 RESOLVED |
| [portfolio-program-project.md](./portfolio-program-project.md) | Портфель → программа → проект, S0 на review |
| [rehearsal-and-open-items.md](./rehearsal-and-open-items.md) | Репетиция показа и открытые E02, E04, F07, C05–C08; согласован 2026-11-06 |
| [director-demo-polish.md](./director-demo-polish.md) | Финальная доводка перед показом директору; согласован 2026-11-06. Платформенный перенос, C05 и E04 вне активной доводки |
| [portfolio-and-calendar.md](./portfolio-and-calendar.md) | Календарный план: дерево строк, таблица и диаграмма. R1/R2 согласованы 2026-11-06. Портфель не меняется |
| [calendar-responsiveness.md](./calendar-responsiveness.md) | Узкая ширина календаря: drawer ниже 1024px и прокрутка внутри доски. Согласован 2026-11-06. F07 и E02 не закрывает |
