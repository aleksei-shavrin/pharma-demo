---
id: DOC-HANDOFF-2026-11-07-PHARMA-CLOSEOUT
title: 'Handoff: pharma demo closeout (C06/C07 + OpenSpec archive)'
type: handoff
status: draft
version: '0.2.1'
created: '2026-11-07'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-DEL-PHARMA-CALL-001
  - DOC-DEL-C06
  - DOC-DEL-C07-ACCEPT
  - DOC-DEL-SCHED-ORDER
---

# Handoff: pharma demo closeout

## Мета

- **От:** Cursor executor / closeout (Codex coordinator)
- **Кому:** человек / следующий агент
- **Дата:** 2026-11-07
- **Область:** call-plan, C06/C07 reports, walkthrough, OpenSpec calendar archive → living `schedule-workspace`

## Цель

Закрыть обратимые остатки C06/C07; заархивировать пять calendar changes; оставить **E02** открытым. Без C05/E04/`reference platform`/мобильности.

## Сделано

### T1 C06

Решение: **keep** `.vis-grid.vis-minor` как месячные границы; hide не вносить. Verify: в `executive-timeline-vis.tsx` minor/major только `color-mix`, не `display:none` (hide только labelset/left). Addendum в [DOC-DEL-C06](../reports/2026-11-06-c06-vis-month-grid.md). Чекбокс C06 `[x]`.

### T2 C07

Критерий: рабочий режим design/§1.8 + [DOC-DEL-C07-ACCEPT](../reports/2026-11-06-c07-product-acceptance.md). ОСУП и отдельный deviation hue **вне** демо; макет не утверждается прочитанным. Targeted tests: comparison / to-gantt / toggle — green; код не менялся. Чекбокс C07 `[x]`.

### T3 Hygiene

В [call-plan](../pharma-demo-call-work-plan.md): 4px→**2px**, устаревшее «пустые links»/«факта нет»/ОСУП-блокеры сняты; E02 единственный remaining. Walkthrough deferred обновлён. `status: draft` не повышался.

### T4 OpenSpec archive

Мандат closeout сессии = apply/archive authority (**не** подмена review 2026-11-06). Tasks: G12 `[x]`, C07 `[x]`, E02 остаётся `[ ]`. Порядок:

1. `2026-11-07-demo-v1-schedule-work-bars-links`
2. `2026-11-07-schedule-hierarchy-baseline-forecast` (1 incomplete E02 → `--yes`)
3. `2026-11-07-schedule-work-actual`
4. `2026-11-07-schedule-c-cross-project-subsample`
5. `2026-11-07-schedule-unified-geometry`

После каждого шага `openspec validate --specs --strict` → 7 passed. Living: `openspec/specs/schedule-workspace/spec.md`.

Spot-check vs code: hierarchy/links/actual/baseline/scroll в living; ROW=32, HEADER=40, GAP=2; adapter SS/FS/FF/SF; factCaption helpers.

### T5

E02 **открыт**. Автопрогон ≠ human.

### Reconciliation (post-merge living contradictions)

**Rationale:** Codex review на целевом ревью living specs после archive пяти calendar changes; пользователь делегировал executor довести правки до конца (**не** fake human approval / не повышение `status`).

**Change:** `reconcile-schedule-living-contract` → archive `2026-11-07-reconcile-schedule-living-contract`.

| Заголовок / сценарий | Правка |
|---|---|
| `Work interval is a single forecast bar` | RENAMED→REMOVED→ADDED: mode-qualified fact; сценарий WK-01 вместо «Snapshot C does not combine…» |
| `Typed display-only dependency links between works` | scope `kind: scheduling` work↔work; не исключает `cross_project_predecessor` |
| `Optional baseline does not replace the forecast bar` | снят «SHALL NOT хранить фактический интервал» |
| `Fact mode names the row` | captions via a11y/`factCaption`/table; SHALL NOT paint на фигурах |
| `Chart marks stay compact and unlabeled` | baseline gap **2px** |
| `Snapshot C adds collapsed power and HVAC branches` | API 113 + default visible **106** |
| architecture `No Activity or WBS…` | links: scheduling work refs и/или milestone→work cross-project |

Код/runtime/browser не менялись. Исторические archive пяти calendar changes не переписывались. E02 open; C05/E04 вне scope.

Follow-up review: DOC-OPS-003 href → `#development`; `require-explicit-schedule-link-kind` убрал kindless-исключение из Typed links (DTO/`явный kind`).

## Remaining

| ID | Статус |
|----|--------|
| **E02** | open — другой участник + walkthrough |
| **C05**, **E04** | open, вне closeout |

## Evidence

`/tmp/pharma-demo-artifacts/pharma-closeout/` · план `.cursor/plans/pharma-closeout-2026-11-07.md`
