---
id: DOC-DEL-SCHED-ORDER
title: Порядок apply календарных OpenSpec change
type: delivery
status: draft
version: 0.1.0
created: '2026-11-06'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-UX-005
  - DOC-DEL-001
---

# Порядок apply календарных OpenSpec change

> **certainty:** fact
>
> Проверка 2026-11-06 на изолированной копии `/tmp/pharma-openspec-order` (rsync рабочего дерева без `.git` и `node_modules`). В основном репозитории living `openspec/specs/schedule-workspace/spec.md` не создавался. Archive и apply там не запускались.

Living spec `schedule-workspace` до этой проверки не существовал. Создаёт его первый change: в дельте только ADDED. Остальные четыре change этот spec дополняют.

## Порядок

1. `demo-v1-schedule-work-bars-links` — создаёт `schedule-workspace` (интервальные работы и типизированные связи). Живое требование `No Activity or WBS entity in enrichment` переименовывается и модифицируется.
2. `schedule-hierarchy-baseline-forecast` — MODIFIED `Work interval is a single forecast bar`. ADDED: иерархия, база, `Expand state is shared by table and chart`.
3. `schedule-work-actual` — только ADDED (факт).
4. `schedule-c-cross-project-subsample` — только ADDED (межпроектная связь).
5. `schedule-unified-geometry` — MODIFIED `Expand state is shared by table and chart` (его добавляет шаг 2). ADDED: общая геометрия.

`schedule-work-actual` и `schedule-c-cross-project-subsample` тоже состоят только из ADDED, поэтому по отдельности могли бы создать пустой по работам spec. Тогда шаг 2 не нашёл бы `Work interval is a single forecast bar`. Их место — после шагов 1 и 2.

## Что поправлено в дельтах

Заголовок MODIFIED в `demo-v1-schedule-work-bars-links` не совпадал с living requirement. MODIFIED оставлен. Добавлен RENAMED с точного заголовка `No Activity or WBS entity in enrichment`. Сценарий `Schedule items are only equipment and milestones` сохранён: THEN и AND прежние, WHEN сужен до снимка без curated works. Два сценария дельты не удалялись.

В `schedule-hierarchy-baseline-forecast` требование `Work interval is a single forecast bar` после модификации было длиннее 500 символов, и `openspec validate --specs --strict` падал. Правило подвыборки C перенесено в новый сценарий того же MODIFIED requirement. Прежние сценарии `Inclusive end maps to visible span` и `Same-day work remains a one-day bar` на месте. MODIFIED не заменялся на ADDED.

## Validate на копии, до apply

`openspec validate <change> --strict --type change --no-interactive` до любого archive:

| Change | Результат |
| --- | --- |
| `demo-v1-schedule-work-bars-links` | valid, exit 0. Сообщения «requirement not found» нет |
| `schedule-hierarchy-baseline-forecast` | valid, exit 0. INFO: archive откажет, spec `schedule-workspace` ещё нет, MODIFIED для нового spec запрещён |
| `schedule-work-actual` | valid, exit 0 |
| `schedule-c-cross-project-subsample` | valid, exit 0 |
| `schedule-unified-geometry` | valid, exit 0. Тот же INFO: spec ещё нет |

## Archive и validate после каждого шага

На копии, в порядке выше, `openspec archive <change> --yes`, затем `openspec validate --specs --strict --no-interactive`.

Каждый archive завершился exit 0. После каждого шага strict validate specs: 7 passed, 0 failed, exit 0. Итог merge:

| Шаг | Specs |
| --- | --- |
| 1 | `schedule-workspace` create, +4. Архитектура: 1 renamed, 1 modified. Незакрытые задачи 2, archive продолжен из-за `--yes` |
| 2 | `schedule-workspace` +5, 1 modified. Архитектура +1. Незакрытые задачи 3 |
| 3 | `schedule-workspace` +12. Предупреждение proposal: больше 10 дельт, не блокирует |
| 4 | `schedule-workspace` +2 |
| 5 | `schedule-workspace` +3, 1 modified |

Purpose уже существующих spec не переписывался: CLI предупредил и оставил прежний Purpose. Это ожидаемо.

До правки длины требование шага 2 давало после archive `openspec validate --specs --strict` с ошибкой: `schedule-workspace` requirements[1] длиннее 500 символов. После переноса правила подвыборки в сценарий strict проходит.

## Что не сделано в основном репозитории

Apply и archive пяти change не выполнялись. В proposal статус остаётся `propose`. Согласие на контракт 2026-11-06 и review отдельных требований записаны, и там же сказано, что living specs этим change не публикуются, а apply/archive — отдельное решение человека. Незакрытые задачи прямо называют apply/archive действием человека.

Следующий шаг человека, если living specs нужно опубликовать, из корня репозитория по одному:

```bash
openspec archive demo-v1-schedule-work-bars-links --yes
openspec archive schedule-hierarchy-baseline-forecast --yes
openspec archive schedule-work-actual --yes
openspec archive schedule-c-cross-project-subsample --yes
openspec archive schedule-unified-geometry --yes
openspec validate --specs --strict
```

`--yes` нужен, потому что у первых двух change остаются незакрытые задачи. Без него CLI останавливается и спрашивает подтверждение. Шаг 2 и шаг 5 до своего предшественника archive отказывает.
