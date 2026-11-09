---
id: PLAN-2026-11-09-PROGRAM-PEOPLE-LAYOUT
title: Dashboard program layout + severity audit + people-focus density
type: cursor-plan
status: draft
version: '0.2.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: demo-v1
related:
  - docs/05-ux-ui/demo-v1-dashboard.md
  - docs/11-ai-engineering/cursor-plans-in-git.md
---

# План: program readiness layout + severity audit + people-focus density

**Путь:** `.cursor/plans/dashboard-program-people-layout.md`  
**Артефакты:** `/tmp/pharma-demo-artifacts/pharma-dashboard-program-people-layout/`  
**Codex execute 2026-11-09:** dual-axis keep only after 19-snap real calc; shared status column width; people all-in-DOM; no fake fact/approved.

**Audit conclusion:** `fillBugs=[]`, `statusBugs=[]` на 19 snaps × 7 programs → **DUAL_AXIS_OK_KEEP** (helper fix не нужен).

---

## 1. Root cause

### 1.1 Карточка «Состояние по программам»

Файл: [`apps/web/src/components/dashboard/workstream-readiness.tsx`](apps/web/src/components/dashboard/workstream-readiness.tsx).

Текущая геометрия строки:

```text
grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)_auto]
= название | SemanticProgressBar (flex-1) | статус-текст+маркер
```

Проблемы UX:

- выглядит как «таблица» из-за плотных залитых рядов (`rowSurface`: Yellow→`--status-warn-bg`, Red→`--status-danger-bg`);
- статус в конце, не как бейдж;
- ширина прогресса «резиновая» (`flex-1` внутри бара) — столбцы не выровнены как фиксированная колонка.

### 1.2 «Критично» при оранжевом прогрессе — не баг подписи

Две независимые оси в API/DTO программы:

| Ось | Поле | Источник | UI-токены | Подпись |
|---|---|---|---|---|
| Health RAG | `status`: Green/Yellow/Red | `PortfolioService.statusOf` / `worstStatus` проектов | `--status-*` | `projectStatusLabel`: В норме / Требует внимания / **Критично** |
| Schedule fill | `progressFillTone`: ok/warn/danger | `fillToneForProgramProjects` ← lag→danger, shift→warn ([`schedule-fill-semantics.ts`](apps/api/src/schedule/schedule-fill-semantics.ts)) | `--schedule-fill-*` | цвет полосы бара (не текст статуса) |

Доказательство на живых данных Demo (`PortfolioService.listPrograms`, ordinal snaps):

| Snap | Program | status | progressFillTone | Смысл |
|---|---|---|---|---|
| 09/10/… | PRG-ENG Инженерия | **Red** | **warn** | Health критичен; schedule fill = shift (оранжевый) |
| 09/10/… | PRG-CON Строительство | **Red** | **ok** | Health критичен; листовой progress без lag/shift → зелёный fill |
| 09 | PRG-DIG / PRG-STA | Yellow | warn | Согласовано warn |
| — | PRG-DSN | Yellow | ok | Health требует внимания; fill ok |

Итог: подпись «Критично» корректна для `status===Red`. Оранжевый бар — другая ось (`progressFillTone`), не ошибка `projectStatusLabel`. Путать их сейчас усиливает заливка **всей строки** цветом `status`, рядом с баром цвета `fillTone`.

> **certainty:** fact — dual-axis status vs progressFillTone в portfolio/dashboard DTO и schedule-fill semantics.  
> **certainty:** fact — PRG-ENG Red+warn и PRG-CON Red+ok наблюдаются на нескольких снимках.

Parity уже допускает расхождение осей ([`schedule-fill-semantics.parity.spec.ts`](apps/api/src/schedule/schedule-fill-semantics.parity.spec.ts): Yellow может быть danger fill).

### 1.3 PeopleFocusPanel

Файл: [`apps/web/src/components/dashboard/people-focus-panel.tsx`](apps/web/src/components/dashboard/people-focus-panel.tsx).

- Summary order сейчас: Ответственные → Критичных → Новых (нужен critical-first).
- `TOP_N=5` + «Показать ещё» / expanded state.
- Left accent `border-l-danger/warn` на строках.
- BE/eligibility/ranking **не** менять (принято).

---

## 2. Согласованные решения

### A. Геометрия программной карточки (FE)

**Колонки (без табличных границ):**

```text
[ название (truncate, minmax 0 1fr) ] [ статус-бейдж auto ] [ прогресс fixed width ]
```

- Статус **в середине**: компактный pill (border+bg+fg по `--status-*` для Red/Yellow/Green), текст только `projectStatusLabel(status)`.
- Прогресс **справа**: обёртка фиксированной ширины (выбрать `w-28` или `w-32`, одна на все строки) вокруг `SemanticProgressBar`; `%` остаётся внутри бара.
- **Убрать** `rowSurface` persistent fill (`data-rag-surface=persistent` / status-*-bg на всей ссылке). Hover: лёгкий `hover:bg-[var(--surface-sunken)]` / underline; focus-ring сохранить; Link на `/programs/{id}` сохранить.
- Mobile (узкий viewport): имя truncate; 3 колонки сохраняются с меньшим gap; при необходимости уменьшить fixed progress до `w-24` через responsive class — без отдельной «карточки на строку», если 3-col читаем @768.

Файлы:

- [`apps/web/src/components/dashboard/workstream-readiness.tsx`](apps/web/src/components/dashboard/workstream-readiness.tsx)
- [`apps/web/src/components/dashboard/workstream-readiness.test.tsx`](apps/web/src/components/dashboard/workstream-readiness.test.tsx)
- при необходимости только className-обёртка у [`semantic-progress-bar.tsx`](apps/web/src/components/progress/semantic-progress-bar.tsx) — **не** ломать другие call sites.

### B. Severity SoT + audit 19 snaps

**Source of truth:**

1. **Бейдж (текст + цвет статуса):** только `status` + `projectStatusLabel` + `--status-*`.
2. **Цвет полосы прогресса:** только `progressFillTone` + `--schedule-fill-*`.

**Не делать:** форс-align fill под Red/Yellow (это сломает schedule semantics и противоречит существующим parity-тестам).

**Аудит (обязателен при реализации):** по всем `listSnapshotIds()` × programs зафиксировать матрицу `(snapshotId, programId, status, label, progressFillTone, progressPct)`. Assertions:

- `label === projectStatusLabel(status)` всегда;
- пары `Red+warn`, `Red+ok`, `Yellow+danger` — **allowed** dual-axis (логировать в артефакт, не fail);
- fail только если fillTone не следует `fillToneForProgramProjects` / warning rules, или label врёт.

Файлы audit: новый Jest в `apps/api` рядом с portfolio/dashboard **или** расширение parity spec; артефакт JSON в `/tmp/pharma-demo-artifacts/pharma-dashboard-program-people-layout/program-severity-audit.json`.

Docs: короткая заметка dual-axis в [`docs/05-ux-ui/demo-v1-dashboard.md`](docs/05-ux-ui/demo-v1-dashboard.md); handoff `docs/07-delivery/handoffs/2026-11-09-dashboard-program-people-layout.md`.

### C. PeopleFocus density (FE; BE frozen)

- Summary порядок: **1. Критичных вопросов → 2. Новых критичных → 3. Ответственных с вопросами**; горизонтально компактнее (меньше padding/gap; critical cell остаётся самым заметным при count>0).
- Убрать left `border-l-*`.
- Убрать `TOP_N` / `expanded` / «Показать ещё»: рендер **всех** `panel.people` в DOM; сохранить `max-h-[32rem]` + list scroll; footer «Показано N из N» + «Все участники».
- Сохранить: zero neutral, critical danger, new warn (только >0), removed green, MetricAbbrTip dedup, entity links title/aria, eligibility/ranking API.

Файлы:

- [`apps/web/src/components/dashboard/people-focus-panel.tsx`](apps/web/src/components/dashboard/people-focus-panel.tsx)
- [`apps/web/src/components/dashboard/people-focus-panel.test.tsx`](apps/web/src/components/dashboard/people-focus-panel.test.tsx)

---

## 3. Doc-first / OpenSpec

1. Обновить UX note (dashboard) — layout программ + dual-axis + people density.
2. OpenSpec draft change **только** если меняется acceptance IA (колонки / all people visible); `status: draft`, без raising certainty→fact / approved.
3. Handoff RU 2026-11-09 с frontmatter.
4. Этот plan file уже в git path `.cursor/plans/` (согласованный).

---

## 4. Tests / gates / browser

**Test-first (failing→passing):**

- Program: order name→badge→progress; no status-*-bg на всей row; fixed-width progress wrapper; link/hover/focus attrs.
- People: summary order critical/new/people; no show-more; N rows in DOM when total=N; no left accent class.
- Audit: 19-snap matrix + label equality; dual-axis samples present/documented.

**Gates:**

- Coverage ≥80 all metrics на изменённых FE файлах (readiness + people-focus); BE — только если тронут audit/helper.
- `npm run typecheck` / lint / arch web; не объявлять full-green foreign failures (`project-cost-fixture` ordinal и т.п.).
- API full suite **не** обязателен, если BE не менялся; если audit в API — прогнать связанные portfolio/fill specs.

**Browser (реализация, не сейчас):**

- existing `localhost:3080`, AppBar ordinals **01 / 03 / 05 / 06 / 19** (+ asOf);
- 1440 / 1920 / 768;
- auth: absolute `.env.dev-auth` + `.dev-login-password`, без вывода значений;
- PNG card+context → artifacts dir;
- критерии: 3-col programs, badge middle red for Критично, orange bar allowed on ENG; people all rows без «Показать ещё»; no overlap/hscroll.

---

## 5. Scope / non-goals

**Делать:** FE layout programs + people; audit+docs dual-axis; tests/gates/browser при execute.

**Не делать:** менять eligibility/ranking peopleFocus; invent status; force fillTone=status; трогать foreign dirty (timeline/gantt/auth/snapshot machine); commit/push; дополнительные dev-серверы.

---

## 6. Risks

- Dual-axis легко принять за баг — снятие row-fill + явный badge снимает визуальную путаницу без ложной унификации.
- `PRG-CON` Red+ok при 100% progress — бейдж остаётся «Критично» (health), бар зелёный (schedule) — ожидаемо после audit docs.
- All people in DOM на E/F (8) + max-h scroll — проверить соседние lower cards.
- Live AppBar/snapshot ids = ordinals `01`…`19` (foreign) — browser scripts должны использовать ordinals, не буквы A–S.
