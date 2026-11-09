## Why

User-facing UI still uses color-words («Красный», «Риск: красный») instead of documented meaning; decision due badges sit under the date column; register related IDs are non-clickable; AppBar shows letter snapshot 09Ds while directors need ordinals 01–19; dashboard decision callout concatenates three ideas; attention card title/items use color language.

## What Changes

- Presentation-only RU labels via shared `ui-labels` / StatusPill: health В норме / Требует внимания / Критично; risk/milestone assessment labels; null → «Нет оценки».
- `/decisions`: column «Статус» left of «Срок»; **move** due badges into Status; Due = date only; summary «Записано» once; no execution tracking.
- Register related IDs: typed links via existing entity routes; DEC list `?q=` when search supports ID; KT only if detail exists.
- Snapshot **display** ordinals 01–19 from `SNAPSHOT_IDS`; internal IDs 01–19 unchanged.
- Decision panel composition + rename attention card to «Сводка» with meaningful item labels.

## Impact

- Specs: UX presentation / dashboard / decisions register (delta drafts).
- Apps: FE primarily; fixtures/API enums immutable.
- Certainty: assumption until human review.

## Out of scope

- Snapshot 09D migration, decision detail route, fake progress/execution, Nest fixture narrative changes.
