## Why

`/projects` показывает text `47% · 7/15 завершено`; `/schedule` — bar+% с semantic fill (lag/shift). Нужны те же колонки Progress + Завершено на projects/programs и **тот же** fill policy для того же project+snapshot.

## What Changes

- List columns: projects `Код|Проект|Прогресс|Завершено|Статус|Программа|Ответственный`; programs `Код|Программа|Прогресс|Завершено|Статус|Ответственные|Проекты`.
- Additive API: `progressPct` (nullable), `progressFillTone`, program list leaf sums; fill via schedule warning+fill semantics (not % , not blind RAG).
- Shared FE progress bar primitive reusing `--schedule-fill-*`.

## Impact

- Affected specs: portfolio-program-project (delta), schedule-workspace (reference only)
- Apps: Nest portfolio + FE portfolio-views + progress primitive
- Certainty: assumption until human review
