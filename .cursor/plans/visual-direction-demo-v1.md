---
name: Visual Direction Demo v1
overview: "COMPLETED docs-волна Visual Direction: primary VD-A; pack DOC-UX-010…013 + handoff; corrective pass (Snapshot A causal, Gantt-only, status-open, a11y principle); VD remains proposal до human baseline APPROVE; apps не автостарт."
todos:
  - id: await-vd-approve
    content: "APPROVE плана + primary VD-A + отдельный handoff — confirmed"
    status: completed
  - id: write-vd-docs
    content: Написать visual-direction + tokens + screen-compositions (+ references при реальных внешних источниках)
    status: completed
  - id: update-indexes-handoff
    content: Обновить README/concept/traceability + отдельный handoff Visual Direction
    status: completed
  - id: vd-quality-gate
    content: test:docs + openspec validate --specs --strict; stop без commit
    status: completed
  - id: vd-no-impl
    content: "Standing constraint (not an impl deliverable): no apps/install/spike/ADR/OpenSpec/Domain/mock/commit — observed through docs wave"
    status: completed
isProject: false
---

# Visual Direction Demo v1 — план docs-волны

## Статус этого плана

**Docs-волна Visual Direction — COMPLETED** (2026-10-31).

| Решение | Статус |
|---------|--------|
| APPROVE плана на запись VD docs | done |
| Primary **VD-A Industrial Control Lattice** | confirmed |
| VD-B / VD-C | сравнение only |
| Отдельный handoff | `docs/07-delivery/handoffs/2026-10-31-visual-direction.md` |
| Pack DOC-UX-010…013 + indexes | written |
| Corrective pass (Snapshot A causal; Gantt secondary read-only; `status-open`; a11y principle ≠ verified WCAG) | done |
| Quality gates `test:docs` + `openspec validate --specs --strict` | PASS |
| Apps / install / Gantt spike / ADR / Domain / BR / REQ / OpenSpec / DOC-PROD-012 | **не** менялись (constraint upheld) |

**VD-A** (и весь Visual Direction pack) остаётся **`proposal`**: требуется отдельный человеческий **APPROVE** Visual Direction as design baseline **до** старта UI Design. D1–D11 = `approved UX decision`. D12 = `deferred decision`. BA-OQ-006 и прочие OQ **не** закрыты.

**Standing constraint (`vd-no-impl`):** создание приложений, установка npm-пакетов, Gantt spike, ADR и переход к реализации **не входят** в выполненную docs-волну и **не** стартуют из её закрытия.

**Следующее (вне этой волны):** human review DOC-UX-010…013 → human APPROVE VD baseline → только затем UI Design / apps (отдельное разрешение).

Workspace: [`.cursor/plans/visual-direction-demo-v1.md`](.cursor/plans/visual-direction-demo-v1.md).

---

## 1. Источники (сверены при написании)

**UX pack (обязательно):** [`docs/05-ux-ui/README.md`](docs/05-ux-ui/README.md), [`demo-v1-ux-concept.md`](docs/05-ux-ui/demo-v1-ux-concept.md), [`demo-v1-shell-navigation.md`](docs/05-ux-ui/demo-v1-shell-navigation.md), [`demo-v1-screens-and-flows.md`](docs/05-ux-ui/demo-v1-screens-and-flows.md), [`demo-v1-dashboard.md`](docs/05-ux-ui/demo-v1-dashboard.md), [`demo-v1-schedule-workspace.md`](docs/05-ux-ui/demo-v1-schedule-workspace.md), [`demo-v1-entity-detail.md`](docs/05-ux-ui/demo-v1-entity-detail.md), [`demo-v1-data-viz-and-components.md`](docs/05-ux-ui/demo-v1-data-viz-and-components.md), [`demo-v1-mock-ux-requirements.md`](docs/05-ux-ui/demo-v1-mock-ux-requirements.md), [`demo-v1-ux-traceability.md`](docs/05-ux-ui/demo-v1-ux-traceability.md), handoff [`2026-10-31-ux-ui.md`](docs/07-delivery/handoffs/2026-10-31-ux-ui.md).

**Ограничения (точечно):** DOC-BA-015 (Links); BR-006 / REQ-IMPCT (PrioritizeRecovery honesty); status allowlist (OnTrack/Delayed; Open/Mitigating; Green/Red — без Closed/Amber без решения); BA-OQ-006 open для layout Issues & Risks Register.

**Не дублировать:** поля/REQ prose, mock volumes (остаются `hypothesis`), OpenSpec UI SHALL.

Примечание: этап H proposal ранее запрещал отдельный Visual Direction file — эта docs-волна **создала** Visual Direction pack; не смешивать с «encyclopedia Design System».

---

## 2. Три существенно разных направления (`proposal`)

Референсы — только для приёмов; **не** копировать бренд/layout чужого продукта. Правила учёта референсов — §2.6 и `demo-v1-visual-references.md`.

| ID | Название | Характер | Отличие от «типового admin» |
|----|----------|----------|------------------------------|
| **VD-A** | Industrial Control Lattice | Современный enterprise project controls: плотность + иерархия + выразительная композиция; slate/steel нейтрали; Page Surface с умеренной глубиной; tabular figures для дат/Δ; RAG без neon/glow | Не Excel-сетка, не SCADA, не mono-таблицы, не карточечный admin dashboard |
| **VD-B** | Precision Workbench | Светлые поверхности + сдержанный синий accent (не purple); shadcn-совместимый token map; умеренные elevation; спокойный enterprise SaaS | Ближе к зрелому B2B tool; зазор от purple-gradient admin template |
| **VD-C** | Narrative Ops Desk | Более выраженная типографическая иерархия на Dashboard; shell спокойный; Page Surface «editorial plate»; таблицы dense | Dashboard как briefing, реестры как ops tools; избегать broadsheet/cream-terracotta клише |

**Primary (confirmed для docs-волны):** **VD-A Industrial Control Lattice**. Tokens и screen compositions записаны под VD-A. VD-B / VD-C — краткое сравнение в visual-direction (+ references stub). VD-A по-прежнему `proposal` до human APPROVE baseline.

Избегать в recommendations: purple-on-white / purple-indigo gradients; warm cream + terracotta + serif cliché; dense broadsheet newspaper look; glow, emoji, multi-layer shadow stacks.

### 2.1. Характер VD-A (уточнение)

Целевой характер — **современный enterprise project controls product**, не «холодный Excel», не SCADA-панель, не монотонные таблицы/прямоугольники, не типовой admin с одинаковыми KPI-карточками.

Сочетать (`proposal`):

- высокую информационную плотность;
- строгую типографическую иерархию;
- выразительную композицию зон (особенно Dashboard);
- быструю считываемость отклонений;
- понятную управленческую историю на Dashboard;
- сдержанную, но заметную визуальную идентичность.

### 2.2. Поверхности и глубина

Не сводить систему только к hairline borders и абсолютно плоским поверхностям.

Осмысленное разделение уровней (`proposal`): application background → Page Surface → рабочие панели → KPI/metric tiles → таблицы → вложенные info areas.

Умеренная elevation; **ограниченное** число уровней глубины (ориентир elevation 0–2 в tokens).

Избегать: многослойных теней; чрезмерных обводок; одинакового визуального веса всех поверхностей; декоративных эффектов без функции.

### 2.3. Цветовая система (первый проход)

В `design-tokens.md` на первом проходе определить прежде всего:

- цветовые роли;
- принципы Light/Dark;
- нейтральную основу;
- accent roles;
- semantic status roles (только allowlisted статусы);
- правила контраста и читаемости.

**Не** фиксировать окончательную палитру преждевременно одним списком HEX. Конкретные значения — обоснованный `proposal` до human review. Status allowlist **не** расширять.

### 2.4. Статусы (визуальная передача)

Статус **не** передаётся только цветом. Сочетать (`proposal`): текстовая метка + цвет + форма/маркер + положение в иерархии.

Не вводить новые бизнес-статусы; не менять интерпретацию существующих (Domain / BR / mock allowlist).

### 2.5. Dashboard (композиция)

Dashboard в первую очередь рассказывает **управленческую историю**:

- состояние проекта;
- отклонения;
- влияние на Production Start;
- causal картина **только** в пределах подтверждённых Domain links;
- Decision PrioritizeRecovery (без execution / без ложного улучшения forecast/RAG — BR-006).

Не превращать Dashboard в коллекцию KPI-карточек и декоративных графиков. KPI-группа: ≥4 обоснованных показателя либо группа отсутствует (`approved UX decision`).

### 2.6. Внешние референсы

Использовать только если реально помогают обосновать решения. В `demo-v1-visual-references.md` явно разделять:

- фактически изученные источники;
- наблюдения;
- собственные рекомендации;
- источники, ещё не изученные (если упомянуты).

Не заявлять «изучен», если не проверялся. Не копировать визуальную идентичность продуктов/брендов. Если внешних источников нет — файл references не создавать или оставить краткий stub с честным «внешние референсы не использовались».

---

## 3. Что зафиксировано в волне vs остаётся open

### Уже `approved UX decision` (не пересматривались)

Shell (Sidebar + App Bar + breadcrumbs + Page Surface); D1–D11; Light/Dark toggle; Snapshot A/B/C; shadcn / TanStack / Recharts; KPI ≥4 or omit; Links vs Impact; Schedule = MS + EQ delivery only; BR-006 honesty; один shell Director+PM.

### Записано как `proposal` (docs-волна)

- Primary visual direction **VD-A** (для pack; baseline APPROVE — отдельно).
- Базовая token system: роли/принципы first; illustrative HEX; semantic status только allowlisted; multi-channel status; surface depth.
- Screen compositions (8 поверхностей); Dashboard narrative-first; Schedule Table/Split/Gantt secondary read-only.
- Desktop-first responsive rules.

### Требуют отдельной оценки / остаются open

| Тема | Статус |
|------|--------|
| D12 Gantt library | `deferred decision` |
| BA-OQ-006 Issues/Risks layout | `open_question` |
| Closed / Amber ambient | `open_question` |
| Mock volume | `hypothesis` |
| Filter persistence / Phase grouping | `assumption` / `open_question` |
| Figma / component library / apps implementation | **out of scope этой волны** (`vd-no-impl`) |
| Human APPROVE Visual Direction как design baseline | **обязателен до UI Design**; AI не ставит frontmatter `approved` |
| Финальная HEX-палитра | `proposal` до human review |

---

## 4. Документы — созданы

| Файл | ID | Содержание |
|------|-----|------------|
| [`docs/05-ux-ui/demo-v1-visual-direction.md`](docs/05-ux-ui/demo-v1-visual-direction.md) | DOC-UX-010 | Identity VD-A; сравнение VD-A/B/C; принципы |
| [`docs/05-ux-ui/demo-v1-design-tokens.md`](docs/05-ux-ui/demo-v1-design-tokens.md) | DOC-UX-011 | Roles / Light-Dark / semantic / depth / a11y principle |
| [`docs/05-ux-ui/demo-v1-screen-compositions.md`](docs/05-ux-ui/demo-v1-screen-compositions.md) | DOC-UX-012 | Shell + key screens; BA-OQ-006 variants open |
| [`docs/05-ux-ui/demo-v1-visual-references.md`](docs/05-ux-ui/demo-v1-visual-references.md) | DOC-UX-013 | Honest stub (внешние product UI не аудировались) |

**Также обновлены:** [`docs/05-ux-ui/README.md`](docs/05-ux-ui/README.md); [`demo-v1-ux-concept.md`](docs/05-ux-ui/demo-v1-ux-concept.md); [`demo-v1-ux-traceability.md`](docs/05-ux-ui/demo-v1-ux-traceability.md); handoff [`2026-10-31-visual-direction.md`](docs/07-delivery/handoffs/2026-10-31-visual-direction.md) + индекс handoffs.

Frontmatter docs: `status: draft`; VD Decision Status в тексте: `proposal`. React/CSS/Figma binary в волне **не** создавались.

---

## 5. Последовательность выполнения — выполнено

1. ~~Сверка UX pack + constraints~~ done  
2. ~~`visual-direction.md`~~ done (DOC-UX-010)  
3. ~~`design-tokens.md`~~ done (DOC-UX-011)  
4. ~~`screen-compositions.md`~~ done (DOC-UX-012)  
5. ~~`visual-references.md`~~ done (DOC-UX-013; honest stub)  
6. ~~README + concept + traceability + handoff~~ done  
7. ~~Gates~~ PASS  
8. ~~Corrective pass~~ done (Snapshot A / Gantt-only / `status-open` / a11y wording)  
9. **Docs-wave closed** — UI Design / apps **не** входят в волну и не стартуют без human APPROVE VD baseline + отдельного разрешения на реализацию.

```mermaid
flowchart LR
  uxPack[Approved_UX_D1_D11]
  vdCompare[VD_A_B_C_compare]
  primary[Primary_VD_A_confirmed]
  tokens[Design_tokens_proposal]
  comps[Screen_compositions]
  gates[Docs_gates]
  closed[Wave_closed]
  uxPack --> vdCompare --> primary --> tokens --> comps --> gates --> closed
```

---

## 6. Quality / consistency checks — результат волны

Критерии §6 плана соблюдены в docs-волне и corrective pass. Повторный gate после corrective: `test:docs` PASS; `openspec validate --specs --strict` PASS.

---

## 7. Решения (confirmed) — docs-волна закрыта

1. APPROVE плана на **запись** Visual Direction docs — **да**; docs-волна — **выполнена и CLOSED**.  
2. Primary для pack — **VD-A**; VD-B/C — сравнение.  
3. Отдельный handoff — **да**.  
4. **VD-A / Visual Direction pack = `proposal`** до отдельного человеческого **APPROVE** design baseline; **без этого APPROVE UI Design не начинать**.  
5. **No-implementation (постоянное ограничение волны):** apps, npm install, Gantt spike, ADR, изменение Domain/BR/REQ/OpenSpec/mock — **не** часть выполненной волны.  

Остаётся вне закрытой docs-волны: финальные HEX; Figma; D12; BA-OQ-006; UI Design / apps (только после human APPROVE VD baseline + отдельного старта реализации).
