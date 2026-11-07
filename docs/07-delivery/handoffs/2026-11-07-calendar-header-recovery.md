---
id: DOC-HANDOFF-2026-11-07-CALENDAR-HEADER-RECOVERY
title: 'Handoff: calendar header recovery (column parity + month scale)'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-07'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-UX-005
---

# Handoff: calendar header recovery

## Мета

- **От:** Cursor executor / calendar-header-recovery (Agent)
- **Кому:** Codex координатор / человек
- **Дата:** 2026-11-07
- **Область:** `docs/05-ux-ui` §1.11; `apps/web` schedule board + DHTMLX adapter; `.cursor/plans/calendar-header-recovery-2026-11-07.md`

## Цель волны

Паритет X/width всех колонок шапки и тела (общий источник ширин) + читаемые подписи месяцев DHTMLX (RU short + yy, min 72, full tooltip) + Object name/id в один ряд. Без `leadOnly` в production, без ломки 32/40, scroll anchors, C07, links.

## Сделано

1. **UX** — [demo-v1-schedule-workspace.md](../../05-ux-ui/demo-v1-schedule-workspace.md) §1.11: паритет колонок, краткая шкала, Object в один ряд (`status` не поднят).
2. **Failing → passing tests** — minWidth formula; fixed name/object header↔body; Object one-line regression; geometry/month-scale unit tests.
3. **Board** — `schedule-column-geometry.ts` + `ScheduleCol` / `ObjectCell`: width parity; forecast **1264** / actual **1792**; Object flex-row + ellipsis + title/aria; ссылка на карточку сохранена.
4. **Gantt** — short RU+yy + title; `min_column_width = 72`; CSS ellipsis.
5. **Проверки:** web+api `tsc` OK; `schedule-board` tests green; parity matrix **12/12** (ранее); point Object C/1440 — height 20 ≤ row 32, `flex-direction:row`. Evidence: `/tmp/pharma-demo-artifacts/calendar-header-recovery/`.

## Не сделано / вне scope

- OpenSpec archive, E02/C06/C07 галочки, мобильная доводка.
- Docs portal build / footer — отдельный коммит.

## Артефакты

| Путь | Примечание |
|------|------------|
| `.cursor/plans/calendar-header-recovery-2026-11-07.md` | План |
| `apps/web/src/lib/schedule/schedule-column-geometry.ts` | Источник ширин |
| `apps/web/src/lib/schedule/schedule-month-scale.ts` | RU short + tooltip |
| `apps/web/src/components/schedule/schedule-board.tsx` | Паритет + Object one-line |
| `/tmp/pharma-demo-artifacts/calendar-header-recovery/parity.json` | Browser matrix 12/12 |
| `/tmp/pharma-demo-artifacts/calendar-header-recovery/object-oneline.json` | Object point check |

## Certainty / риски

> **certainty:** assumption
>
> Browser matrix и Object point — один Chromium. Dual-browser не гонялся.

## Блокеры

- Нет для коммита header-трека. E02/C06/C07 по-прежнему открыты.
