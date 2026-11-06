---
id: DOC-HANDOFF-2026-11-06-XPROJ
title: 'Handoff: межпроектная связь на снимке C закрыта'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-06'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-HANDOFF-2026-11-06-SCHED-OWN
  - DOC-UX-005
  - DOC-ADR-0004
---

# Handoff: трек межпроектной связи закрыт

## Мета

- **От:** Агент №3, подвыборка AN-24 → AN-09 и связь `LNK-X-PWR-HVAC`
- **Кому:** следующие писатели общих файлов Schedule. Комплект показа этим файлом не передаётся.
- **Дата:** 2026-11-06
- **Область:** change `schedule-c-cross-project-subsample`, fixtures и отрисовка одной связи на снимке C

## Цель волны

Два требования на снимке C: дерево энергоснабжения и HVAC рядом с эпизодом AN-08, затем одна межпроектная линия без типа FS/SS/FF/SF.

## Сделано

- Оба требования change [schedule-c-cross-project-subsample](../../../openspec/changes/schedule-c-cross-project-subsample/proposal.md) реализованы. Review требования 2 принят 2026-11-06. Дельта: [spec.md](../../../openspec/changes/schedule-c-cross-project-subsample/specs/schedule-workspace/spec.md). Задачи 1.1–3.2 отмечены.
- Дерево: на C свёрнутые по умолчанию «Внешние сети и энергоснабжение» и «HVAC и системы подготовки воздуха». Полное раскрытие — 113 строк, одна `MS-UTL-PWR`. На A, D и F новых групп нет.
- Стрелка: `LNK-X-PWR-HVAC`, `kind=cross_project_predecessor`, `milestone:MS-UTL-PWR` → `work:9.3.2`, поля типа нет. Четыре связи WK остаются `scheduling`.
- UX §1.9 и addendum ADR-0004 записаны до кода. `openspec validate schedule-c-cross-project-subsample --strict --type change --no-interactive` проходил после этих правок.

## Проверки

- API: `GET /backend/v1/projects/PRJ-01/schedule?snapshot=C` — 113 строк, одна `MS-UTL-PWR`, пять связей. У `LNK-X-PWR-HVAC` нет `type`. A, D и F — по 96 строк и без этой связи.
- Jest: `apps/api/src/schedule/schedule.service.spec.ts` — 29 прошло. Принимается `LNK-X-PWR-HVAC`. Отклоняются отсутствующий конец, направление work→milestone и тип планирования на межпроектной записи.
- Vitest: `apps/web/src/lib/schedule/cross-project-predecessor.test.ts` — 4 прошло, включая скрытие линии в режиме факта, когда закрытый факт заменяет прогнозную полосу. Рядом прошли `to-gantt-presentation.test.ts` (32), `schedule-comparison.test.ts` (11), `visible-rows.test.ts` (13), `schedule-view.test.tsx` (7), `schedule-board.test.tsx` (6).
- Браузер, `http://127.0.0.1:3080/schedule`, снимок C, 2026-11-06. После раскрытия обеих веток — `113 / 113`, одна новая линия и четыре стрелки WK. Подпись: «Межпроектное предшествование, тип не указан». Сворачивание каждой ветки по очереди убирает только новую линию. Линия остаётся в режимах «Базовый план / прогноз» и «Базовый план / факт» и в тёмной теме. У «Подключение к сетям» факта нет, поэтому в режиме факта линия крепится к прогнозной полосе.

## Освобождаю

Агент №3 больше не пишет эти файлы:

- `apps/api/src/data/fixtures/schedule-works.ts`
- `apps/api/src/schedule/dto/schedule.dto.ts`
- `apps/api/src/schedule/schedule.service.ts`
- `apps/api/src/schedule/schedule.service.spec.ts`
- `apps/api/src/schedule/schedule-link-rules.ts`
- `apps/web/src/lib/api-client.ts`
- `apps/web/src/lib/schedule/to-gantt-presentation.ts`
- `apps/web/src/lib/schedule/cross-project-predecessor.test.ts`
- `apps/web/src/components/schedule/dhtmlx-gantt-adapter.tsx`
- `apps/web/src/components/schedule/schedule-view.tsx`
- `docs/05-ux-ui/demo-v1-schedule-workspace.md` — только §1.9 этого трека
- `docs/06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md` — только addendum межпроектной линии
- `docs/03-product/demo-v1-mock-narrative-data.md` — раздел подвыборки AN-24 → AN-09

## Не сделано / вне scope

- Apply и archive change. Living spec `schedule-workspace` не публиковался.
- Комплект показа, репетиция и общий план остаются у Агента №1. Заметка для будущего шага лежит отдельно и задачей ему сейчас не передаётся: [2026-11-06-show-kit-cross-project-note.md](./2026-11-06-show-kit-cross-project-note.md).
- C07 `schedule-work-actual` остаётся у Агента №2.
- Адаптивность узкой ширины остаётся у своего трека. Ему по-прежнему можно править раскладку; поля факта и `LNK-X-PWR-HVAC` этим треком не забирались.

## Certainty / риски

> **certainty:** fact
>
> Состав ответа C, отсутствие типа у `LNK-X-PWR-HVAC` и поведение линии в браузере проверены 2026-11-06 на локальном `127.0.0.1:3080`.

> **certainty:** assumption
>
> Закрытый факт у `9.3.2` в снимке не задан. Скрытие линии в этом случае покрыто тестом `cross-project-predecessor.test.ts`, не кадром браузера.

## Блокеры

Нет.

## Рекомендации следующей волне

1. Не откатывать `kind` связи и не возвращать тип планирования на `LNK-X-PWR-HVAC`.
2. Archive change делать только после явного apply. Этот трек архив не открывает.
