---
name: Dashboard management cards + decision execution
overview: "IN PROGRESS: 3 dashboard cards + illustrative decision execution. Codex corrections applied (F not_started wording; register Status dual dims; recoveryExecuted deprecated; I≠completed)."
todos:
  - id: P-PROPOSAL
    content: Accepted audit/proposal (programs/decisions/exceptions feasibility)
    status: completed
  - id: P-HANDOFF
    content: Handoff proposal-only 2026-11-09
    status: completed
  - id: P-IMPL-PLAN
    content: Concrete implementation plan + execution-model extension
    status: completed
  - id: D-DOCS
    content: Docs-first draft — UX/OpenSpec/handoff + plan Codex fixes
    status: completed
  - id: D-HANDOFF-EXEC
    content: Handoff implement wave + artifacts dir pointer
    status: completed
  - id: B-EXEC-FIXTURE
    content: Nest observations DEC-001 F not_started→G in_progress→O completed; others unknown
    status: completed
  - id: B-DTO-API
    content: Programs progress; execution DTO; panelState DEC-001; honesty deprecated+forecastDeviation
    status: completed
  - id: B-PROG-ROLLUP
    content: Dashboard programs via PortfolioService.programStatuses (one-way inject)
    status: completed
  - id: B-TESTS
    content: Test-first API panel/exec/parity/integrity
    status: completed
  - id: F-PROGRAMS
    content: FE programs SemanticProgressBar+% ; 7 rows; no chip
    status: completed
  - id: F-DECISION-CARD
    content: FE «Прогноз и решение» PS; no TEX[0]
    status: completed
  - id: F-DECISIONS-REG
    content: FE Status=execution+due-state; Due=date only (8 cols)
    status: completed
  - id: F-EXCEPTIONS
    content: FE critical link-evidence + danger chrome
    status: completed
  - id: F-TESTS
    content: FE unit/RTL ≥80 changed
    status: completed
  - id: Q-GATES
    content: lint/tsc/build/arch/coverage
    status: completed
  - id: Q-BROWSER
    content: Browser AppBar matrix + artifacts /tmp/pharma-management-cards-execution/
    status: completed
isProject: true
---

# Dashboard management cards — implementation plan (accepted + execution)

**Сессия:** `dbf0df0f` · Auto only · **нет** Task/Explore/Browser AI / nested CLI  
**Статус плана:** accepted UI + **pending Codex review** на execution-model extension → затем implement  
**До review:** apps/fixtures **не** менять этим планом-апдейтом  
**Артефакты реализации:** `/tmp/pharma-management-cards-execution/`  
**certainty:** assumption (продуктовое расширение demo) · **не** fact/approved/GMP · docs останутся `draft`/`assumption`

Ссылки: [DOC-UX-004](../../docs/05-ux-ui/demo-v1-dashboard.md), [DOC-UX components DecisionSummary](../../docs/05-ux-ui/demo-v1-component-specification.md), [mock narrative](../../docs/03-product/demo-v1-mock-narrative-data.md), [BR-004/006 via REQ-PROJ](../../docs/04-requirements/REQ-PROJ-001.md), [openspec project-status-overview](../../openspec/specs/project-status-overview/spec.md), prior progress [.cursor/plans/projects-programs-semantic-progress.md](./projects-programs-semantic-progress.md).

---

## A. Accepted product decisions (зафиксировано пользователем)

1. **Программы:** `name | canonical progress bar+% | health` · 7 compact rows · critical-first · backend enrich overview · **без** attention chip в V1.  
2. **Health canonical:** тот же статус, что реестр `/programs` — сейчас оба пути уже через `programSummariesFor` / `PortfolioService.statusOf` ([portfolio.service.ts](../../apps/api/src/portfolio/portfolio.service.ts) L856–875). При enrich **не** изобретать новый RAG; добавить progress поля; сверка fixture consistency тестом parity dashboard↔list.  
3. **Решение на дашборде:** сигнал, не реестр · title **«Прогноз и решение»** · PS-driver only · не маскировать отсутствие DEC-001 другими DEC · не TEX[0].  
4. **Исполнение ≠ запись ≠ эффект на прогноз** · реестр показывает real execution status · due отдельно.  
5. **Attention critical:** linked facts only · light danger + thin border · no ordinary divider · severity≠impact · all evidenced critical stay critical · PS+NN только explicit driver.  
6. **Execution model** разрешена минимально: illustrative Nest observations, read-only, без CRUD/command UI «отметить выполнено».

---

## B. Decision execution model (concrete)

### B.1 Разделение трёх осей

| Ось | Поле | Не выводить из |
|---|---|---|
| Record | наличие `Decision` в snapshot (`buildDecisions`) | — |
| Execution | `executionStatus` + observation meta | `dueDate`, наличия record, улучшения forecast, EQ done без явной observation |
| Forecast effect | `decisionHonesty.recoveryExecuted` **остаётся `false`** (BR-006) + residual Δ из project/MS | execution `completed` |

`completed` действие **может** сосуществовать с Red risk / residual Δ — UI обязан показывать residual.

### B.2 Types (Nest + FE mirror)

```ts
/** Effective execution of a Decision action — not record, not forecast heal. */
export type DecisionExecutionStatus =
  | 'unknown'      // нет observation → UI «Нет данных об исполнении»
  | 'not_started'
  | 'in_progress'
  | 'completed';
// 'cancelled' — OUT OF V1 (нет authored narrative source)

export type DecisionExecutionObservation = {
  id: string;                    // e.g. DEXO-001-F
  decisionId: DecisionId;        // integrity: must exist in DECISION_CATALOG
  status: Exclude<DecisionExecutionStatus, 'unknown'>;
  /** Calendar date of this observation (≤ scenarioAsOf when visible). */
  asOfDate: string;              // YYYY-MM-DD
  /** First snapshot letter where this observation may appear. */
  effectiveFromSnapshot: SnapshotId;
  source: 'demo-execution-observation';
  evidenceNote: string;          // RU illustrative provenance text
  updatedAt: string;             // same as asOfDate for demo (explicit field)
};
```

На Decision DTO (dashboard list item + `/decisions` register item), additive:

```ts
executionStatus: DecisionExecutionStatus; // default 'unknown'
execution: null | {
  status: Exclude<DecisionExecutionStatus, 'unknown'>;
  evidenceNote: string;
  source: 'demo-execution-observation';
  updatedAt: string;
  observationId: string;
};
```

`execution === null` ⇔ `executionStatus === 'unknown'`.

### B.3 Visibility / asOf rules

Для snapshot `S` с `scenarioAsOfDate = D`:

1. Observation `o` **видима**, если `isAtOrAfter(S, o.effectiveFromSnapshot)` **и** `o.asOfDate <= D`.  
2. На decision выбирается **последняя** видимая observation (max `asOfDate`, tie-break max `effectiveFromSnapshot` order A–S).  
3. Нет видимых → `unknown`.  
4. Integrity tests: ни одна observation с `asOfDate > D` не утекает в ранний snapshot; `decisionId` ∈ catalog; `effectiveFromSnapshot` ≥ `DECISION_CATALOG[id].first`.

### B.4 Demo observations (illustrative — не GMP fact)

**Файл:** `apps/api/src/data/fixtures/decision-execution-observations.ts`  
**Resolver:** `apps/api/src/data/decision-execution.ts` (`resolveExecution(decisionId, snapshotId, asOfDate)`).

Только **DEC-001** получает authored arc (остальные DEC → всегда `unknown` в V1 — доказывает empty state в реестре без пустых fake completed):

| obs id | from | asOfDate | status | evidenceNote | source.label |
|---|---|---|---|---|---|
| `DEXO-001-F` | F | 2027-04-20 | `not_started` | Действия не начаты | Демонстрационный отчёт исполнителя |
| `DEXO-001-G` | G | 2027-05-15 | `in_progress` | Действия начаты | Демонстрационный отчёт исполнителя |
| `DEXO-001-O` | O | 2027-09-01 | `completed` | Действия закрыты | Демонстрационный отчёт исполнителя |

- `source.kind` = `'demo'` (явно в DTO/UI; illustrative, не GMP).
- «Действия ещё не подтверждены» **не** использовать как `not_started` — это смысл **unknown**.
- I (до O) остаётся `in_progress`. S = `completed` + residual/balanced из snapshot facts.
- Другие DEC без observations → `unknown` (не NotStarted).

**Не** подгоняем `psForecast` / RAG / alphabet под UI. Observations **сопровождают** существующий нарратив.

`cancelled` не вводим.

### B.5 `decisionPanelState` (breaking semantic fix, additive honesty)

Сейчас: `recorded` если `decisions.length > 0` — **маскирует** отсутствие DEC-001.

**Новое правило** ([derived-impact.ts](../../apps/api/src/common/derived-impact.ts)):

```
if (primaryDecision(snapshot)) → 'recorded'   // только DEC-001
else if (PS issue Open|Mitigating && EQ-HVAC Delayed) → 'needed'
else → 'absent'
```

Другие DEC на `/decisions` остаются; **карточка дашборда их не использует как primary**.

`decisionHonesty`: при `recorded` по-прежнему `{ recoveryExecuted: false }`. Документировать: поле = «автовосстановление прогноза не утверждается», **не** синоним `executionStatus`.

### B.6 Backcompat

- Старые клиенты без `execution*` игнорируют additive fields.  
- FE labels: unknown → «Нет данных об исполнении» (уже близкий copy на register).  
- Не удалять `dueState`; не трактовать `passed` как failed execution.

---

## C. Card 1 — Programs implementation

### C.1 API

`DashboardOverview.programs[]` additive:

```ts
{
  id, name,
  status, // canonical = programSummariesFor / portfolio statusOf (same)
  progressPct: number | null,
  leafCompleted: number,
  leafTotal: number,
  progressFillTone: ScheduleFillTone,
}
```

**Shared rollup:** вынести leaf sum + fillTone в pure/helper module (напр. `apps/api/src/portfolio/program-progress-rollup.ts`), вызываемый из `PortfolioService.programSummary` и `DashboardService` — **не** inject PortfolioService→Dashboard (circular с ScheduleService). Dashboard получает тот же результат, что `GET .../programs`.

### C.2 FE

[workstream-readiness.tsx](../../apps/web/src/components/dashboard/workstream-readiness.tsx): mid-row reuse existing `SemanticProgressBar` (programs list). Layout: `name | bar+% | health badge`. V1 **без** attention chip. Preserve 7 rows, critical-first, compact padding, 768/1440/1920.

### C.3 Wireframe

```
СОСТОЯНИЕ ПО ПРОГРАММАМ
◆ Инженерия      ████████░░░░ 42%     КРИТИЧНО
▲ Строительство  ██████████░░ 61%     ВНИМАНИЕ
● …              ████████████ 78%           ОК
```

---

## D. Card 2 — «Прогноз и решение»

### D.1 Content model (PS only)

```
reason: EQ-HVAC status + ISS/RISK ids from derivedImpact
currentImpact: productionStartDeltaDays + forecast date (+ residual when recorded)
decision: absent | needed | recorded(DEC-001)
execution: unknown|not_started|in_progress|completed (+ evidence one-liner)
honesty: recoveryExecuted false; completed ≠ forecast heal
CTA: /decisions + /decisions focus or entity links EQ/ISS/RISK/MS/DEC-001
```

Удалить `neededContextLine` → `topExceptions[0]`.

### D.2 Wireframes (sample snapshots)

**A — absent:** карточка не рендерится (lower-grid dense).

**E — needed:**

```
ПРОГНОЗ И РЕШЕНИЕ                    Все решения
⚠ Требуется решение
Причина: EQ-HVAC-01 Delayed · ISS-001 Open|Mitigating
Влияние: PS +21 · прогноз 2027-10-06
Решение DEC-001 не зарегистрировано
Запись сама не меняет прогноз
[EQ] [ISS] [RISK] [MS-PS]
```

**F — recorded + not_started + residual +21:**

```
… Исполнение: Не начато · Демонстрационный отчёт исполнителя · «Действия не начаты»
… Запись сама не устраняет отклонение (BR-006)
CTA: Открыть решение · Открыть проблему
```

**G / I — in_progress + residual (I < O → НЕ completed):**

```
… Исполнение: В работе · «Действия начаты»
```

**O / S — completed + residual if Δ>0:**

```
… Исполнение: Выполнено · «Действия закрыты»
… residual Δ / driver facts из DTO; completed ≠ heal
```

---

## E. `/decisions` register table UX (exact columns) — Codex correction

**Сохранить 8 колонок:** ID · Тип · Суть · **Статус** · **Срок** · Владелец · Веха · Контекст  

- **Статус** (слева от Срок): **два явно подписанных** измерения в одной ячейке:
  1. основное «Исполнение: …» (`Нет данных` / `Не начато` / `В работе` / `Выполнено`) — StatusPill execution tones (unknown neutral / in_progress info / completed ok); **не** меняет risk Red.
  2. вторичное «Срок: …» (`не задан` / `впереди` / `сегодня` / `прошёл`) — due-derived; все due badges **только здесь**.
- **Срок:** **только** дата или «—». **Запрещено** возвращать due badges под/рядом с датой.
- Не дублировать статус в двух колонках; не fake ×N «Записано».
- Ширина: короткие подписи + title/aria; wrap; fit 1440/1920; 768 inner overflow.
- Filter due сохраняется; execution filter не в V1.

## E2. recoveryExecuted semantics (Codex)

- `decisionHonesty.recoveryExecuted: false` — **deprecated** BR-006 legacy always-false when recorded; **не** «действие не исполнено».
- New UI **не** опирается на него для execution.
- Additive `forecastDeviation`: `within_baseline` \| `deviation_persists` (from PS Δ).
- Copy: BR-006 «запись сама по себе не устраняет отклонение» — не «исполнение никогда не моделируется».

---

## F. Card 3 — Top attention critical

### F.1 Rule (unit-tested pure FE or shared)

```
criticalEvidence if any linked:
  risk.rag===Red | milestone.rag===Red | (equipment.critical && Delayed)
attentionOnly: open/mitigating issue without co-critical link facts → no «Критично»
impactWeight=ps_driver if link in {EQ-HVAC-01,RISK-001,MS-PS}
  OR (ΔPS>0 && MS-PS linked)
Δ chip only if impactWeight && ΔPS>0 from project variance (not regex)
else if !criticalEvidence → neutral (no false critical)
```

Order: curated `priority`. Several critical → all critical chrome.

### F.2 Visual

- Critical row: `--status-danger-bg` + thin `--status-danger-border` ring.  
- No `border-b` on critical rows.  
- Badge «Критично»; title → primary cause link; secondary source links.  
- Remove `index===0` + regex accent.

---

## G. Docs / OpenSpec (before or with first code — Documentation First)

| Doc | Change (draft/assumption) |
|---|---|
| `docs/05-ux-ui/demo-v1-dashboard.md` | B02 progress mid-row; B04 title «Прогноз и решение»; panelState by DEC-001; execution axis; B06 critical rule |
| `docs/05-ux-ui/demo-v1-component-specification.md` | DecisionSummary: execution ≠ Pending invent; honesty |
| `docs/03-product/demo-v1-mock-narrative-data.md` | DEXO catalog pointer; F/G/O observations; «execution not modeled» → «illustrative observations» |
| `openspec/changes/...` или sync note | delta decision execution read-model; BR-006 unchanged meaning |
| handoff | `docs/07-delivery/handoffs/2026-11-09-dashboard-management-cards-impl.md` |

Не ставить `status: approved` / certainty fact.

---

## H. Implementation stages (Codex-executable order)

1. **D-DOCS** — draft docs/OpenSpec/handoff.  
2. **B-EXEC-FIXTURE** — observations + resolver + integrity specs (red→green).  
3. **B-PROG-ROLLUP** + **B-DTO-API** — programs enrich; decision fields; panelState fix; OpenAPI.  
4. **B-TESTS** — API contract/parity.  
5. **F-PROGRAMS / F-DECISION-CARD / F-EXCEPTIONS / F-DECISIONS-REG** — FE + labels.  
6. **F-TESTS** — RTL/unit.  
7. **Q-GATES** — lint, tsc, build, arch, coverage ≥80 changed FE and BE.  
8. **Q-BROWSER** — live AppBar snapshots **01, 03, 06, 09, 19** (A/C/F/I/S letter mapping per project snapshot selector), execution colors/source/CTA, responsive 1440/1920/768, no SSR label mismatch; dump to `/tmp/pharma-management-cards-execution/`.

Preserve: prior ui-labels, portfolio gray/`Портфель` filter, auth, progress fill semantics, foreign gantt diffs. No commit/push/deploy. Dev on :3080 as usual.

---

## I. Test matrix (meaningful)

| ID | Assert |
|---|---|
| T-PROG-PARITY | dashboard.programs[i].progress* === listPrograms items same snapshot |
| T-PROG-STATUS | status === programSummariesFor status (no invent) |
| T-PANEL-A | A → absent, card hidden |
| T-PANEL-E | E → needed even if later other DEC exist in other snaps; no TEX[0] |
| T-PANEL-F | F → recorded DEC-001; execution not_started; honesty false |
| T-EXEC-ASOF | observation G invisible on F; visible on G+ |
| T-EXEC-UNKNOWN | DEC-UTL-01 → unknown on F |
| T-EXEC-COMPLETE-RESIDUAL | O/S completed + ΔPS may be >0 |
| T-TEX-CRIT | F TEX critical by Red links; Δ only HVAC-PS row |
| T-TEX-NOREGEX | causeImpact without numbers still critical if links Red |
| T-REG-COLS | Status column shows execution; due badge under Срок |
| T-COV | ≥80 changed statements/branches FE+BE |

---

## J. Gotchas

1. **PanelState change** ломает тесты, где `recorded` = any DEC — обновить specs явно.  
2. **Не** derive execution из `eqDelta` / due / forecast — только catalog.  
3. **Circular Nest:** shared rollup module, не Dashboard↔Portfolio inject.  
4. **Legacy copy** «исполнение не отслеживается» → заменить на unknown vs concrete status.  
5. **decisionHonesty.recoveryExecuted** не переключать в true при completed.  
6. **Gantt/other writers:** не трогать schedule adapter paths.  
7. Narrative docs still say C has DEC-001 in older ABC stub — **runtime** DEC-001 `first: F`; plan follows **runtime catalog**, sync docs draft accordingly.

---

## K. Out of scope V1

- Attention chip on program rows  
- Execution filter / command UI / CRUD / DB  
- `cancelled` status  
- Observations for every DEC  
- New synthetic «signals register»  
- Changing A–S forecast/RAG alphabet for prettier cards  

---

## L. Compact verdict (for Codex)

| Тема | Решение |
|---|---|
| Plan path | `.cursor/plans/dashboard-management-cards-proposal.md` |
| Programs | enrich overview via shared rollup; bar+%; health=existing canonical |
| Decision card | «Прогноз и решение»; DEC-001 panelState; execution axis; residual honesty |
| Execution data | `decision-execution-observations.ts` · DEC-001 F not_started → G in_progress → O completed · else unknown |
| Register | 8 cols: Исполнение + Срок(дата+состояние срока) |
| Exceptions | linked-fact critical + ps_driver Δ |
| Auth | Codex review → implement; no new user permission round |
