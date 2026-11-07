# Proposal

## Why

В `Typed display-only dependency links between works` после reconcile осталась фраза «(или ранний эквивалент без kind)». Позднее requirement `Milestone to work link is an untyped cross-project predecessor` и API DTO требуют явный `kind`; fixtures всегда задают `kind`. Нужна точечная синхронизация living text.

## What Changes

- **MODIFIED** `Typed display-only dependency links between works`: убрать kindless-исключение; scheduling links SHALL нести явный `kind: scheduling`.

## Capabilities

### New Capabilities

_нет_

### Modified Capabilities

- `schedule-workspace`: явный `kind` на scheduling links

## Impact

Только living OpenSpec. Код не меняется. Исторические archives не переписываются.
