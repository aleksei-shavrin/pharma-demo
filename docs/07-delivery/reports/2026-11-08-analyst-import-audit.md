---
id: DOC-RPT-2026-11-08-ANALYST-IMPORT
title: Аудит — полный импорт аналитика в календарь и программы
type: report
status: draft
version: 0.4.0
created: '2026-11-08'
updated: '2026-11-08'
owner: demo-engineering
related:
  - DOC-PROD-012
  - DOC-HANDOFF-2026-11-08-ANALYST-MERGE
certainty: assumption
---

# Аудит: импорт аналитика (повторный проход Codex)

## Источник

- Путь: `apps/api/src/data/fixtures/analyst/demo-pharma-greenfield.md`
- SHA-256: `9958582606ed60acfc6191f45cea7bb5be745f5021f22d6a21684fa3a3f664ef`
- «Одна программа Greenfield» в источнике → имя portfolio `PRJ-01` (не `PRG-GREENFIELD`).
- UI: 7 программ (`PRG-*`) + 25 проектов (`AN-*`).

## Точные итоги парсера

| Метрика | Число |
|---|---|
| Проекты | 25 |
| Этапы | 145 |
| Работы | 272 |
| Контрольные точки (КТ) | 147 |
| Строки | 564 |
| Критические швы | 7 (12 атомарных рёбер) |

## Сборка расписания (снимок C)

| Вид | Число |
|---|---|
| project_group | 25 |
| stage_group | 145 |
| work (272 + 5 WK) | 277 |
| equipment_delivery | 52 |
| milestone catalog_milestone | 42 |
| milestone controlpoint (145 KT-* + 2 alias) | 147 |
| **всего items** | **688** |

Alias `MS-CLN-PANEL` / `MS-UTL-PWR` несут `sourceKind=controlpoint`, raw `sourceStatus`/`sourceWeeks`/имя из источника.

## Связи

- Лист↔лист (`work`|`milestone`) для intra → `scheduling` + FS; для ⇢ → `cross_project_predecessor` без инверсии направления.
- Швы: группы вокруг стрелок (`A → B,C` = fan-out; `A → B → C` = цепочка).
- `droppedResolvableCount = 0` для resolvable refs; unresolved — только exact list.

## Даты / прогресс

- Якорь C asOf = `2027-03-01`.
- Без hash/rank/random. Actuals ≤ asOf на A–S.
- Portfolio list+detail: `progressLabel` = доля `Completed` среди works+КТ того же импорта (не mean leaf % и не seed «по статусам исходника»).
- В UI дат — краткая подпись «Демо-даты» при DEMO_ASSUMPTION; без English `supplementary` в product copy.

## WS → AN → PRG

| WS | Назначение |
|---|---|
| WS-QC | AN-20 (PRG-STA), не AN-08 |
| WS-PKG | EQ primary AN-13 (не склад AN-14) |

## Артефакты

`/tmp/pharma-demo-artifacts/pharma-analyst-programs-1c199ddd/`
(`browser-evidence-r2.json` schedule; `browser-evidence-r3.json` portfolio list/detail)
