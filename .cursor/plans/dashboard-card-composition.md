---
id: PLAN-DASH-CARD-COMPOSITION-2026-11-09
title: 'Dashboard card composition — critical clip / ChangeTile border / Decision case'
status: draft
created: '2026-11-09'
updated: '2026-11-09'
owner: demo-engineering
certainty_note: 'Plan accepted for execute (user-relay of Codex read). Apps implemented 2026-11-09; result evidence in /tmp/pharma-dashboard-card-composition/FINAL-RESULT.md. Do not treat as Codex-accepted stamp on the result.'
refs:
  - docs/05-ux-ui/demo-v1-dashboard.md
  - openspec/changes/dashboard-management-cards/specs/management-exception-report/spec.md
  - openspec/specs/management-exception-report/spec.md
  - .cursor/plans/dashboard-management-cards-proposal.md
  - AGENTS.md
---

# План: композиция трёх dashboard-карточек

**Режим:** plan-only → Codex review → execute позже. **Apps сейчас не трогать.**  
**Референс:** clipboard PNG (снимок **11**, light) — clipped critical rings, ChangeTile без контура, flat «Прогноз и решение».  
**Dev:** `http://127.0.0.1:3080` (login 200 на момент плана).

## 1. Findings (root cause)

### 1.1 «Требует внимания» — critical box clip

**Файлы:** [`apps/web/src/components/dashboard/top-exceptions-panel.tsx`](apps/web/src/components/dashboard/top-exceptions-panel.tsx), shared [`apps/web/src/lib/dashboard/dashboard-layout.ts`](apps/web/src/lib/dashboard/dashboard-layout.ts).

| Класс / место | Эффект |
|---|---|
| `ModuleSurface` + `DASHBOARD_PAIR_SURFACE_CLASS` → `overflow-hidden` + `max-h-[28rem]` | Клип всего содержимого поверхности |
| `DASHBOARD_PAIR_LIST_SCROLL_CLASS` → `overflow-y-auto` на `<ol>` | **Второй** clip-context для детей |
| Critical `<li>`: `ring-1 ring-[var(--status-danger-border)]` | Ring рисуется **снаружи** box; у края scrollport обрезается сверху/слева/снизу |
| Нет horizontal padding на `<ol>` под ring | Левый/правый ring упирается в gutter scrollbar |

**Не баг:** частичный clip mid-item при user-scroll. **Баг:** first/last critical без полного контура в покое и при scroll-to-end.

**Preserve:** `DASHBOARD_PAIR_*` caps/`min-h-0`/paired fill; `gap-2.5`; critical ≠ divider; accepted critical semantics (`assessTopExceptionCritical`).

### 1.2 Snapshot Changes — фон без semantic border

**Файл:** [`apps/web/src/components/dashboard/trend-panel.tsx`](apps/web/src/components/dashboard/trend-panel.tsx) — `ChangeTile`.

Сейчас только `bg-[var(--status-*-bg)]` + fg; **нет** `border`. Empty tile (`items.length===0` → `null`) и empty-all copy — оставить.

### 1.3 «Прогноз и решение» — flat stream

**Файл:** [`apps/web/src/components/dashboard/decision-panel.tsx`](apps/web/src/components/dashboard/decision-panel.tsx).

Recorded: линейный `space-y-2` без зон «кейс / связанное решение / исполнение / CTA» → визуально «несколько равноценных абзацев».  
Данные уже корректны (принятая семантика): один PS-driver кейс, DEC-001, execution ≠ forecast (BR-006), human labels, CTA `/decisions?q=` + `/issues/:id`. Нужна **композиция**, не domain rewrite.

**Specs:** `docs/05-ux-ui/demo-v1-dashboard.md` (assumption block); OpenSpec `management-exception-report` / change `dashboard-management-cards` — PS-driver only, DEC-001 panelState, no register dump.

## 2. Ownership (execute wave)

| Path | Действие |
|---|---|
| `top-exceptions-panel.tsx` (+ unit test при наличии) | Fix clip |
| `trend-panel.tsx` (+ test если есть) | Semantic border catalog |
| `decision-panel.tsx` (+ `dashboard-view` / panel tests) | One-case composition |
| `dashboard-layout.ts` | **Не менять** в этой волне (concurrent writers) |
| `dashboard-view.tsx` / programs / people / snapshot ids | **Не трогать**; preserve |

**Перед execute:** дождаться завершения root PIDs concurrent writers (**766977** layout/programs+people; **764721** snapshot numeric) — не читать их raw logs / не resume. Потом только 3 компонента + isolated tests + короткий UX note.

## 3. Proposed direction (для Codex)

### 3.1 Critical items — inset contour + list gutters

- Заменить outer `ring-1` на **inset** контур: `border border-[var(--status-danger-border)]` **или** `ring-1 ring-inset` + сохранить `bg-[var(--status-danger-bg)]` + `rounded-[var(--radius-sm)]`.
- На `<ol>`: горизонтальный gutter (`px-1` / `pr-1.5`) + вертикальный padding (`py-1`), чтобы first/last border полностью виден в покое и при scroll top/bottom.
- Critical: **не** `border-b` divider; neutral rows — divider only.
- `gap` между boxed rows сохранить; **без** horizontal scroll.
- Focus: `focus-visible:outline-offset-2` внутри padded list (не уезжает за clip).
- Pair card: сохранить `DASHBOARD_PAIR_SURFACE_CLASS` / list `flex-1 min-h-0` — без regress пустого ⅓ пространства.

### 3.2 ChangeTile — thin semantic border

Каталог (1px, существующие tokens, без тяжёлого outer card):

| tone | bg (as-is) | border (add) |
|---|---|---|
| better | `--status-ok-bg` | `border border-[var(--status-ok-border)]` |
| worse | `--status-danger-bg` | `border border-[var(--status-danger-border)]` |
| critical (unchangedCritical) | `--status-warn-bg` | `border border-[var(--status-warn-border)]` |

Empty / missing tiles — без изменений visibility.

### 3.3 Decision card — ONE management case

**Модель (immutable):** один кейс «Запуск производства»; одно связанное решение DEC-001; execution read-model независим от forecast; states `needed|recorded` + exec `unknown|not_started|in_progress|completed`; absent → null; no multi-driver invent; no CRUD/%/status calc; mock `source.kind=demo` readable; owner/due только если уже в API и не раздувает карточку.

#### Text wireframe (recorded, напр. 11 in_progress)

```
┌ ModuleSurface (pair cap) ─────────────────────────────────┐
│ ПРОГНОЗ И РЕШЕНИЕ                    [Все решения]        │
│ Кейс: Запуск производства · один сигнал PS-driver         │
├───────────────────────────────────────────────────────────┤
│ Запуск производства                                       │
│   +N дн · прогноз ДД.ММ.ГГГГ · отклонение сохраняется?    │
│   Причина: {eq human} · {risk human}                      │
│   IDs secondary links                                     │
├─ Связанное решение (neutral group, не 2-я «карточка») ───┤
│   {presentDecisionType} · DEC-001                         │
│   note compact if useful                                  │
│   Исполнение: [StatusPill]                                │
│   {demo source}: {evidence} · на {asOf}                   │
│   caveat short (только needed / completed+residual)       │
├───────────────────────────────────────────────────────────┤
│ [Открыть решение]  [Открыть проблему?]                    │
└───────────────────────────────────────────────────────────┘
```

**needed:** один danger callout «Требуется решение» + тот же scope caption; без блока «Связанное решение»; CTA проблема + реестр.

**Явные labels:** «Кейс: Запуск производства»; «Связанное решение» — снимают ambiguity «один элемент vs список».  
Не три равноценных bordered cards; не registry dump.

## 4. Tests / gates (execute)

- Unit: critical chrome class ≠ outer ring (attr/`data-exception-chrome`); ChangeTile `data-trend-bucket` + border class presence; decision: heading + scope caption + «Связанное решение» + CTA hrefs; raw enum absence; states needed/recorded/exec variants via fixtures.
- Не зеркалить pixel CSS в snapshot tests.
- FE: lint + typecheck; coverage ≥80 на **changed** files; build — если plan gates требуют / при сомнении.
- Browser (после layout writers): 1440/1920/768; light (+ dark contrast tokens); snapshots **05 needed / 11 in_progress / 15 completed**; DOM bbox: first/last critical borders fully visible at scroll extremes; ChangeTile computed border; decision zones; focus-visible; no pageerror.
- Артефакты: `/tmp/pharma-dashboard-card-composition/` (screenshots, JSON, FINAL note).

## 5. Non-goals

- Не менять API/fixtures/execution observations/RAG/forecast.
- Не трогать auth/gantt/timeline/programs/people/shared layout constants в этой волне.
- No commit/push/deploy/new deps.
- Не claim Codex accepted до human/Codex review этого плана.

## 6. Execute checklist (future)

1. Wait PIDs 766977 & 764721 exit; re-check git dirty foreign files.
2. Patch only 3 components (+tests); preserve pair layout contracts.
3. FE gates → browser matrix → `/tmp/pharma-dashboard-card-composition/` + handoff RU.
4. Stop; Codex review.

## 7. Key decisions (для ревью)

1. Critical: **inset border/ring + list padding**, не снятие overflow с pair surface.
2. ChangeTile: **1px tone border** к существующему bg.
3. Decision: **одна case-композиция** с явными «Кейс» / «Связанное решение», без второго register и без domain rewrite.
