# Proposal

## Why

После archive пяти calendar changes living `schedule-workspace` и `demo-v1-architecture-constraints` сохранили ранние SHALL, которые противоречат уже принятым C07/продукту (факт-полоса, WK-01 база+связи, `cross_project_predecessor`, compact captions, зазор 2px). Нужна семантическая сверка living SoT с UX §1.8–1.11 и кодом без новых features.

## What Changes

- **RENAMED→REMOVED→ADDED** `Work interval is a single forecast bar`: OpenSpec запрещает drop scenario через MODIFIED и ADDED+REMOVED одного имени; промежуточный `(pre-reconcile)` снимает невозможный «Snapshot C does not combine…», исходный заголовок возвращается с WK-01 (база+SS/FS) и mode-qualified fact.
- **MODIFIED** early baseline/links/captions/geometry: optional baseline без запрета actual; scheduling scope по kind; captions a11y не paint; gap **2px**; Snapshot C + visible 106 / API 113.
- **MODIFIED** architecture: links не «только work refs» — допуск milestone→work для `cross_project_predecessor`.
- Код apps **не** меняется. Исторические archive folders **не** переписываются.

## Capabilities

### New Capabilities

_нет_

### Modified Capabilities

- `schedule-workspace`: согласовать ранние forecast/links/baseline/caption/geometry clauses с C07 и unified geometry
- `demo-v1-architecture-constraints`: квалифицировать display-only links (scheduling vs cross-project)

## Impact

Только living OpenSpec + docs/handoff ссылки. Портал публикует `openspec/specs/`. Runtime/browser не гоняются. E02 остаётся открытым.
