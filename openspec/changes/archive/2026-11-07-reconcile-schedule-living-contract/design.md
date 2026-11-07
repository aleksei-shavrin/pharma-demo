# Design

## Context

Closeout `4018f78` смержил пять deltas в living specs. Ранние ADDED/MODIFIED из bars-links и hierarchy остались буквальными и конфликтуют с поздними actual/cross-project/geometry требованиями и с продуктом.

## Goals / Non-Goals

**Goals:** один корректирующий change с точными MODIFIED-заголовками; qualify by mode/kind; заменить невозможный C-сценарий на WK-01; sync captions/gap/visible counts с UX §1.8–1.11.

**Non-Goals:** новый продукт; rewrite archive; raise frontmatter status; закрыть E02; runtime/browser regression suite.

## Approach

1. Delta: MODIFIED по точным заголовкам; для смены сценариев у `Work interval…` — RENAMED→REMOVED→ADDED (сохраняет итоговый заголовок, обходит запрет drop scenario / same-name ADDED+REMOVED).
2. Apply/archive обычным CLI; validate `--specs --strict` после.
3. Review rationale в handoff: Codex review + user delegated closeout execution — не fake human review дат.

## Decisions

| Тема | Решение |
|------|---------|
| Фактическая полоса | Запрет в forecast-режиме; в fact-режиме закрытый факт = нижняя полоса (уже в Comparison requirement) |
| WK-01 | Продукт допускает базу + SS/FS; lab-only запрет снять |
| Links | `scheduling` = work↔work typed; `cross_project_predecessor` = milestone→work untyped |
| Captions | Accessible/table/title/`factCaption`; SHALL NOT paint на bar/diamond/arrow |
| Gap | 2px (`BASELINE_GAP_PX`) |
| Counts | API 113 fully expanded; default expansion visible 106 |

## Risks

- Duplicate purpose warnings при archive — ожидаемо, Purpose не трогаем.
- Portal rebuild нужен после merge living text.
