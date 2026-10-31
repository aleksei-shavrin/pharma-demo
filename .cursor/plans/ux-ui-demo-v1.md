---
name: UX UI Demo v1
overview: "Единый план UX/UI Demo v1: D1–D12 = UX Discovery recommendations / proposal baseline (ещё без per-item human APPROVE); действующие Domain/BR/REQ/Demo v1 constraints; mock volume = hypothesis; этап H — UX Proposal+Handoff в docs (draft/proposal). Ждать APPROVE плана на выполнение docs."
todos:
  - id: discovery-baseline
    content: "Discovery UX: D1–D12 как UX Discovery recommendations / proposal baseline (не per-item APPROVE)"
    status: completed
  - id: await-plan-approve
    content: Дождаться APPROVE единого плана на выполнение этапа H (запись docs), не путать с APPROVE каждого D1–D12
    status: completed
  - id: verify-sources
    content: Сверить первоисточники OpenSpec/BR/REQ/domain/mock/walkthrough перед черновиками
    status: completed
  - id: write-ux-docs
    content: Написать компактный набор docs/05-ux-ui/* + обновить README
    status: completed
  - id: write-handoff-gate
    content: Handoff 07-delivery + indexes; test:docs; openspec validate --specs --strict; diff; stop без commit
    status: completed
  - id: no-impl
    content: Не apps / install / spike / OpenSpec / DOC-PROD-012 / ADR / commit без команды
    status: completed
isProject: false
---

# UX/UI Demo v1 — единый план (Discovery + Proposal/Handoff)

## Статус

Единый план. **Части A–G** — UX Discovery recommendations / **proposal baseline** + действующие ограничения Domain Model / BR / REQ / Demo v1 scope (не дублировать при docs-write). **Часть H** — этап фиксации в `docs/05-ux-ui/` + handoff. Отдельный план `UX Proposal Handoff` **не** использовать.

**Терминология D1–D12 (обязательно):**

- D1–D12 = **`UX Discovery recommendations` / `proposal baseline`**.
- **Нет** утверждения, что по каждому D1–D12 уже был отдельный явный **human APPROVE**.
- В UX Proposal docs решения D1–D12 фиксировать со статусом **`draft` / `proposal`** (frontmatter `status: draft`; certainty / decision status = UX proposal), пока human отдельно не утвердит каждый пункт или пакет.
- Утверждённые ранее **Domain Model, BR, REQ, Demo v1 scope** (в т.ч. BA-OQ-001 freeze, living OpenSpec Must) сохраняют свой действующий статус источников — это **не** то же самое, что APPROVE UX-layout решений.
- **Mock volume** = **`hypothesis`** only; DOC-PROD-012 не менять на этапе H.
- **BA-OQ** и технические вопросы (D12 lib choice, SVAR fit, filter persistence и т.д.) остаются **`open`**.
- AI **не** ставит `status: approved` на UX docs.

**Сейчас Plan Mode:** запись в репозиторий — только после APPROVE **этого плана на выполнение этапа H** (разрешение писать docs), что **не** равносильно APPROVE всех D1–D12.

---

# Часть A — Application Shell

## A1. Оболочка

**Left Sidebar** + **Top Application Bar** (Breadcrumbs, Snapshot A/B/C, Light/Dark) + **Page Surface**. Стек: **shadcn/ui**, **TanStack Table**, **Recharts**. Charts ≠ Gantt.

## A2. Sidebar (D9)

```text
Dashboard
Schedule
Equipment
Issues & Risks
Milestones
```

## A3. Entity Detail + Breadcrumbs

**D4:** Full Page + Tabs (Overview · Links · Impact). KPI не обязательны ≥4 на каждой карточке.

| Переход | Breadcrumbs | Возврат |
|---------|-------------|---------|
| Schedule → EQ/MS detail | `Schedule / …` | к Schedule; filter/sort/page — насколько позволит реализация |
| Реестр → detail | `Equipment|Issues & Risks|Milestones / …` | к реестру |
| Detail → связанный объект | только по **существующим** Domain links | без виртуальных рёбер |
| Dashboard → detail | `Dashboard / …` или deep-link раздела | Back → Dashboard; Snapshot в App Bar |

Без Activity / доменной «истории переходов» / API ради breadcrumbs. MVP: возврат без фильтров допустим (`assumption`).

## A4. A → B → C + BR-006

PrioritizeRecovery → Issue Mitigating; Risk/MS Red; PS forecast без изменения; нет recovery execution / auto-reforecast.

---

# Часть B — Project Schedule

| ID | Lean |
|----|------|
| **D9** | Dashboard widget + Milestones registry + Schedule workspace; 5 Sidebar |
| **D10** | TanStack Table primary; read-only Gantt secondary |
| **D11** | Только Milestone + Equipment delivery; без Activity / WBS / CPM / deps / scheduling engine |
| **D12** | SVAR OS кандидат №1 (**не финал**); custom timeline — полноценная альтернатива; выбор до tech evaluation |

Schedule визуализирует **существующие даты**, не моделирует несуществующие работы.

---

# Часть C — Объём mock (`hypothesis`)

| Набор | Диапазон |
|-------|----------|
| Equipment | 40–60 |
| Milestones | 15–20 |
| Issues | 15–30 |
| Risks | 15–25 |
| Decisions | 3–6 |
| Schedule | ≈ 55–80 control points (MS + EQ) |

Не отраслевой норматив. **DOC-PROD-012 в этапе Proposal не изменять.**

---

# Часть D — Целостность данных

## D.1 Популяция и narrative

Одна популяция A/B/C; стабильные id; без новых доменных полей; Dashboard = реестры; baseline/forecast/variance согласованы; сюжет **EQ-HVAC-01 → ISS-001 → RISK-001 → MS-PS → DEC-001** ≠ схема прямых рёбер; BR-006 honesty; Critical Milestone только presentation; без связей «ради виджетов».

## D.2 Связи Domain Model

Не трактовать narrative как `Equipment ↔ Issue ↔ …`. Только cardinality DOC-BA-015 (нет прямой Equipment—Milestone). Без новых FK ради UI.

## D.3 Статусы / RAG

| Допустимо в Must/ambient | Не использовать без отдельного решения |
|--------------------------|----------------------------------------|
| OnTrack, Delayed; Open, Mitigating; Green, Red (fixture/BR) | **Closed**, **Amber**; AcceptDateSlip post-state (BA-OQ-004/005) |

---

# Часть E — Плотность UI

Таблицы, KPI из реальных агрегатов, распределения подтверждённых статусов, upcoming/slipping, links по Domain Model, causal viz, timeline control points. Без декоративных графиков и без обязательных 4 KPI на каждой entity card.

---

# Часть F — Реестр D1–D12

| ID | Lean (содержание recommendation) | Статус |
|----|----------------------------------|--------|
| D1 | Dashboard start | `UX Discovery recommendation` / `proposal baseline` — **без** per-item human APPROVE |
| D2 | Sidebar multi-page | то же (через D9) |
| D3 | Director priority на Dashboard | то же |
| D4 | Full Page + Tabs + breadcrumbs §A3 | то же |
| D5 | Δ-полоса; delivery ≠ PS | то же |
| D6 | PrioritizeRecovery + BR-006 honesty | то же |
| D7 | Один shell Director+PM | то же |
| D8 | Dashboard composition; typed Exceptions | то же; **BA-OQ-006 open** |
| D9 | 5 пунктов + Schedule workspace | то же |
| D10 | TanStack + read-only Gantt | то же |
| D11 | MS+EQ control points only | то же |
| D12 | SVAR OS №1 / custom alt; lib **отложена** | то же + **open** tech choice |

---

# Часть G — Открытые вопросы (не закрывать в Proposal)

- BA-OQ-006, BA-OQ-004/005, BA-OQ-002 / HIP-003/004/007 / HIP-005
- Closed / Amber без отдельного решения
- Финальный Gantt lib (D12) — после tech evaluation
- Phase grouping; глубина persistence фильтров списка

---

# Часть H — Этап UX Proposal + Handoff (документация)

## H.1 Цель

Зафиксировать части A–G как **UX Proposal** в [`docs/05-ux-ui/`](docs/05-ux-ui/) + handoff: frontmatter **`status: draft`**; решения D1–D12 в тексте — **`proposal` / UX Discovery recommendation**, не «human approved». Без apps, без правки OpenSpec/BR/REQ/DOC-PROD-012/ADR, без install/spike.

## H.2 Источники при написании (первоисточники)

Living OpenSpec (6 specs); domain-model + business-rules; REQ-*; capabilities / functional-scope / mock / walkthrough / architecture; stakeholder-needs; process-specs; traceability-matrix; ba-registers; Discovery SCN; documentation-standard; handoff template; **этот** план (A–G).

## H.3 Структура файлов (компактно, без дублирования A–G прозой)

| Файл | Назначение |
|------|------------|
| [`docs/05-ux-ui/README.md`](docs/05-ux-ui/README.md) | Индекс |
| `demo-v1-ux-concept.md` | Summary, аудитория, **ссылка на D1–D12**, constraints, open Q index |
| `demo-v1-shell-navigation.md` | Shell, 5 nav, theme, Snapshot control, breadcrumbs |
| `demo-v1-screens-and-flows.md` | Inventory + A→B→C (+ PM paths) |
| `demo-v1-dashboard.md` | Director Dashboard (D8); BA-OQ-006 open |
| `demo-v1-schedule-workspace.md` | Table/Gantt control points (D10–D12) |
| `demo-v1-entity-detail.md` | Full Page + Tabs + return |
| `demo-v1-data-viz-and-components.md` | shadcn / TanStack / Recharts / Gantt candidates deferred |
| `demo-v1-mock-ux-requirements.md` | Volume **hypothesis** + integrity + status allowlist; **не** правит DOC-PROD-012 |
| `demo-v1-ux-traceability.md` | UX Decision → Screen → BR/REQ/OpenSpec → Data → Status |
| `docs/07-delivery/handoffs/2026-10-31-ux-ui.md` | Handoff |
| + строки в handoffs README | |

**Не плодить:** отдельный Visual Direction / Open Questions mono-file / Design System encyclopedia.

**Traceability статусы ячеек:** `approved requirement` (ссылка на источник) | `UX proposal` | `assumption` | `hypothesis` | `open_question`.

## H.4 Последовательность

1. Сверка первоисточников  
2. `ux-concept` + каркас `ux-traceability`  
3. `shell-navigation` → `screens-and-flows`  
4. `dashboard` ∥ `schedule-workspace` ∥ `entity-detail`  
5. `data-viz-and-components` + `mock-ux-requirements`  
6. Дописать traceability; README; handoff + indexes  
7. Quality Gate → отчёт; **stop без commit** (пока не попросите)

## H.5 Quality Gate

- Domain cardinality + status allowlist соблюдены в тексте  
- A/B/C + BR-006 honesty  
- Schedule без Activity/WBS/CPM  
- KPI/charts имеют data source  
- Screen inventory ↔ 5 nav + details  
- Traceability покрывает D1–D12  
- `npm run test:docs`  
- `openspec validate --specs --strict` (**без** изменения specs)  
- Нет apps / новых ADR / правок DOC-PROD-012  

## H.6 После handoff (не автостарт)

Human review UX docs → отдельно: mock expansion / Gantt spike / apps. Не планировать scaffold Next/Nest в этой волне.

## H.7 Риски этапа docs

Docs drift от specs → сверка + traceability; случайное «закрытие» BA-OQ-006 → явные open_question; давление на Activity в Schedule → D11 в schedule doc + gate.

---

# Final Review (единый план)

## Discovery (A–G)

Зафиксированы recommendations: shell, Schedule, mock **hypothesis**, целостность связей/статусов, breadcrumbs. **D1–D12 = proposal baseline**, не пакет уже выданных per-item human APPROVE. Действующие Domain/BR/REQ/Demo v1 scope — как источники. BA-OQ и D12 lib choice — **open**.

## Следующий исполняемый этап (H)

После APPROVE **плана на запись docs** (не путать с APPROVE всех D*): писать compact UX proposal pack (`draft`/`proposal`) + handoff + gates.

## Ждёт вашего решения сейчас

1. APPROVE **единого плана на выполнение этапа H** (разрешение писать docs по §H.3).  
2. Отдельный поздний human APPROVE по D1–D12 (поштучно или пакетом) — **после** review UX Proposal docs, не подразумевается автоматически.  

После «выполняй / implement» — только docs/handoff/gates по части H; commit — по отдельной просьбе.

---

# Стоп (Plan Mode)

Обновлён **только** основной Cursor plan `UX UI Demo v1`. Репозиторий не менялся. Самостоятельный план Proposal+Handoff не развивать — считать поглощённым частью H.
