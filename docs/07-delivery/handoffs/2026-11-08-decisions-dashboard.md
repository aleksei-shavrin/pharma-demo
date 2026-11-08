---
id: DOC-HANDOFF-2026-11-08-DECISIONS-DASHBOARD
title: 'Handoff: decisions register + dashboard pair UX (r2+r3)'
type: handoff
status: draft
version: 0.4.0
created: '2026-11-08'
updated: '2026-11-08'
owner: demo-engineering
certainty_note: 'r3 desktop column fit; timeline/portfolio parallel dirty not owned here.'
---

# Handoff — decisions / dashboard (r2 + r3)

Артефакты: `/tmp/pharma-demo-artifacts/pharma-decisions-dashboard-1c199ddd/`
Финальные r3: `FINAL-RESULT-r3.txt`, `gates-r3.json`, `browser-proof-r3.json`, `shots-r3/`.
r2: badges/names/height (`browser-proof-r2.json`). `browser-proof.json` — устаревший.

## r3 закрыто (desktop fit)

- Убран `min-w-[72rem]` на desktop (≥lg): `table-fixed` + column width hints.
- `<lg` (вкл. 768): `min-w-[64rem]` + table-auto → внутренний hscroll; page overflow 0.
- `RegisterEntityCell` optional `className` для вехи без жёстких 14rem.
- Proof S@1440/1920: `tableHScroll=false`, «Портфель (PRJ-01)» полностью в контейнере.

## r2 закрыто

1. StatusPill-style badge срока (нейтрально; «Сегодня» при `dueDate==asOf`; passed ≠ failed).
2. `milestoneName` / `analystProjectName` в Decisions register DTO из snapshot/catalog.
3. Placeholder «Поиск решений»; ID nowrap.
4. Copy: «Данные об исполнении не указаны. Прошедший срок не подтверждает неисполнение.»
5. Pair height-bounded + nestedTd/console 0.

## Семантика

| Измерение | Значения / UI |
|---|---|
| record | summary «Записано» (без ×N колонки) |
| dueState API | `none` \| `upcoming` \| `passed` |
| badge FE | + «Сегодня» когда `dueDate === scenarioAsOfDate` |
| execution | данные не указаны (без Demo/v1 phrasing) |

## Gates (честно)

| Gate | Result |
|---|---|
| API full unit | 55 suites / 320 tests / exit 0 |
| Coverage changed branches | API 82.35 / FE 83.23 |
| FE arch + lint changed | 0 |
| FE manifest | 96 / 0 missing / 0 failed / 475 |
| browser-proof-r2 | findings 0 / 9 cases |
| Project `tsc` | red on **foreign** portfolio specs/tests; registers/decisions paths clean |

## Не трогали

Timeline (другой контекст), auth/deploy dirty, schedule/toast/r11, fake execution fields.
