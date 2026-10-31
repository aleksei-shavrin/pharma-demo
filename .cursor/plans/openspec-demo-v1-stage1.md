---
name: OpenSpec Demo v1 Stage1
overview: "Stage 1 завершён: change define-demo-v1-project-control формализовал Must Demo v1 (C-01…C-05), human APPROVE → sync living openspec/specs → archive 2026-10-31; apps/OQ закрытие вне scope."
todos:
  - id: os-verify
    content: Проверить CLI/status change define-demo-v1-project-control; instructions artifacts
    status: completed
  - id: os-proposal
    content: Написать proposal.md (Must scope, A-B-C, out, success)
    status: completed
  - id: os-specs
    content: "Delta specs: 5 functional + demo-v1-architecture-constraints; AcceptDateSlip только как тип/ограничение"
    status: completed
  - id: os-design-tasks
    content: design.md (EQ snapshot reproducibility open; без выбора механизма) + tasks.md только formalization/docs/QA
    status: completed
  - id: os-validate
    content: openspec validate/status PASS
    status: completed
  - id: docs-sync
    content: Traceability, C-01 BR mapping, REQ README, handoff, Stage1 report, .cursor/plans
    status: completed
  - id: qa-gates
    content: npm run test:docs + semantic checklist; итоговый отчёт; stop на product decisions
    status: completed
  - id: sync-archive
    content: Human APPROVE → sync living specs → archive change; validate --specs; commit 7dd319c
    status: completed
  - id: docs-post-archive
    content: Ограниченная актуализация путей living/archive в docs + plan (без apps)
    status: completed
isProject: false
---

# Stage 1 — OpenSpec Demo v1 Must

## Статус (2026-10-31)

**Stage 1 completed.** Change `define-demo-v1-project-control`:

- Living SoT: `openspec/specs/<capability>/spec.md` (6 capabilities).
- Archive: `openspec/changes/archive/2026-10-31-define-demo-v1-project-control/`.
- Active path `openspec/changes/define-demo-v1-project-control/` **больше не существует**.
- Commit sync/archive: `7dd319c`.
- Open: AcceptDateSlip post-state / UI / messaging / BA-OQ/HIP; apps — вне этой фазы.

Ниже — исходный план formalization (сохранён как история последовательности).

## Исходное состояние

- Stage 0 audit: [docs/07-delivery/reports/2026-10-31-req-openspec-readiness-audit.md](docs/07-delivery/reports/2026-10-31-req-openspec-readiness-audit.md) — Must ready; AcceptDateSlip post-state / UI / messaging out.
- OpenSpec CLI **1.15.0**, schema **`spec-driven`** (`proposal` → `specs` → `design` → `tasks`).
- Living specs на старте Stage 1 были пусты (`openspec/specs/` только README).
- Scaffold change: `openspec/changes/define-demo-v1-project-control/` (переиспользован; после archive — см. archive path выше).
- Commit / push / apps / ADR — **не** в scope Stage 1 formalization (sync/archive — отдельная волна после APPROVE).

## Change и capabilities (зафиксировано)

Change ID: **`define-demo-v1-project-control`**

Delta specs → living (пути):

| Capability dir | C / REQ | Living path | Содержание Must |
|---|---|---|---|
| `project-status-overview` | C-01 / REQ-PROJ-001 | `openspec/specs/project-status-overview/spec.md` | PRJ-01 поля; A/B/C dates; C без сдвига после PrioritizeRecovery; Phase **не** Must |
| `milestone-readiness` | C-02 / REQ-MILE-001 | `openspec/specs/milestone-readiness/spec.md` | MS-PS dates/rag; link RISK-001 на B/C; fixture+integrity BR-003; no runtime RAG engine |
| `equipment-delivery-status` | C-03 / REQ-EQPT-001 | `openspec/specs/equipment-delivery-status/spec.md` | EQ-HVAC-01; +21d; OnTrack/Delayed; delivery ≠ PS dates; воспроизводимость Snapshot A/B/C (механизм — later) |
| `risk-issue-impact` | C-04 / REQ-RISK-001 | `openspec/specs/risk-issue-impact/spec.md` | Issue≠Risk; BR-001 capability vs NC-001 fixture раздельно; Mitigating только от PrioritizeRecovery; Closed transitions **не** специфицировать |
| `management-exception-report` | C-05 / REQ-IMPCT-001+002 | `openspec/specs/management-exception-report/spec.md` | Aggregate + Decision; **основной workflow C-05 = PrioritizeRecovery**; AcceptDateSlip — известный тип / out boundary, без Must AC/state machine |
| `demo-v1-architecture-constraints` | NFR-001/002 | `openspec/specs/demo-v1-architecture-constraints/spec.md` | FE→HTTP only; persistence port; PG out; port ≠ auto-compatibility |

Имена совпадают с кандидатами DOC-PROD-010 (+ один NFR capability).

```mermaid
flowchart LR
  A[SnapshotA] --> B[SnapshotB]
  B --> C[SnapshotC_PrioritizeRecovery]
```

AcceptDateSlip **не** входит в основной demo flowchart как пользовательский сценарий.

## Жёсткие правила содержания specs

- Primary narrative: A → B → C (**PrioritizeRecovery**); значения/даты/связи **только** из [demo-v1-mock-narrative-data.md](docs/03-product/demo-v1-mock-narrative-data.md).
- **AcceptDateSlip:** допускается упомянуть как известный тип Decision и как **ограничение области** (BA-OQ-004/005 open). **Запрещено:** самостоятельный обязательный user scenario; полноценные функциональные AC; state machine Issue/Risk/MS; включение в основной C-05 workflow. Основной C-05 workflow — **только PrioritizeRecovery**.
- Нет: CPM, recovery execution, auto-reforecast, runtime RAG engine, Activity entity, C-06/C-07 Must, GMP/CSV claims.
- Requirements: атомарные SHALL + Scenario с THEN, трассировка к REQ/BR в тексте (related/source), без копипаста BA docs.

## EQ write-path / воспроизведение snapshots

**Нормативно (specs):** система / Demo v1 dataset **должны воспроизводить** утверждённые Snapshot A/B/C (включая EQ delivery states и BR-004 dates). Не предписывать конкретный механизм.

**В design.md:** явно зафиксировать **open / deferred implementation detail** — механизм переключения или обновления между A/B/C (snapshot switching, backend operation, иное) **не выбран** на этапе OpenSpec; не перечислять два обязательных варианта реализации; не выдавать выбор за принятое продуктовое решение.

**Product decision rule:** если при формализации выяснится, что без выбора механизма нельзя однозначно сформулировать пользовательски наблюдаемое поведение — **остановиться и задать конкретный вопрос пользователю**, не решать самостоятельно.

Aggregate DTO: в design можно назвать контракт (напр. `DirectorImpactAggregate`) по полям REQ-IMPCT-001; смысл не менять.

## Порядок артефактов OpenSpec (выполнен)

1. `openspec status --change define-demo-v1-project-control --json`
2. Для каждого artifact: `openspec instructions <id> --change ... --json` → писать по `template`/`instruction` в `resolvedOutputPath`
3. Порядок: **proposal** → **specs** (6 capability dirs) → **design** → **tasks**
4. `openspec validate` / status до зелёного состояния артефактов
5. Apply/archive — **после** human APPROVE (выполнено 2026-10-31); apps implementation — отдельно

### proposal.md
Проблема/цель Demo v1; Must C-01…C-05; A→B→C PrioritizeRecovery; out of scope (AcceptDateSlip SM/AC, UI, C-06/07, CPM, recovery exec, PG, auth; EQ switch mechanism deferred); assumptions; success criteria (walkthrough business outcome).

### specs/*/spec.md
Нормативное поведение; scenarios покрывают Snapshot A/B/C где применимо; AcceptDateSlip — только boundary/out notes, без Must scenarios; Closed transitions out.

### design.md
Логические компоненты FE/BE/mock adapter; domain entities/links (ссылка на DOC-BA-015); REST ownership mock NestJS; persistence port; **EQ A/B/C reproducibility + deferred mechanism**; open questions list (включая BA-OQ и deferred impl); не выбирать ORM/auth/DB без ADR.

### tasks.md
**Только** задачи текущего этапа: создание/доработка OpenSpec artifacts, синхронизация docs/traceability, validation, `test:docs`, Stage 1 report.  
**Запрещено:** фиктивные implementation tasks; scaffold Next/Nest; API/UI/DB tasks; «implement capability X in code».

## Синхронизация docs (минимальная)

| Файл | Действие |
|---|---|
| [docs/02-business-analysis/traceability-matrix.md](docs/02-business-analysis/traceability-matrix.md) | Колонка OpenSpec → living paths; archive path в примечании |
| [docs/03-product/demo-v1-capabilities.md](docs/03-product/demo-v1-capabilities.md) | C-01…C-05 (+ NFR) OpenSpec living; archive history |
| [docs/04-requirements/README.md](docs/04-requirements/README.md) | Living vs archive; BA-OQ-001 freeze |
| [docs/07-delivery/handoffs/](docs/07-delivery/handoffs/) | Handoff `2026-10-31-req-openspec.md` — Stage 1 + archive complete |
| [docs/07-delivery/reports/](docs/07-delivery/reports/) | `2026-10-31-req-openspec-stage1.md` — formalization + §10 archive |
| Delivery README | Ссылка на Stage 1 report |

Не трогать: mock snapshots/dates, BR-001…007 текст, Domain cardinality (кроме ссылок), BA-OQ statuses, Discovery narrative, текст living specs.

## Product decisions во время выполнения

- Не предполагать, что design assumptions закрывают все вопросы.
- При неоднозначности, **требующей продуктового решения** (меняет наблюдаемое поведение / AC / scope) — **стоп** и конкретный вопрос пользователю.
- Не маскировать такие решения под assumption без явной маркировки и без остановки, если они влияют на Must-поведение.

## Проверки завершения Stage 1

1. OpenSpec validate/status для change — PASS (до archive)  
2. `npm run test:docs` — PASS  
3. Semantic checklist: snapshots A/B/C; Issue≠Risk; delivery≠PS; no CPM/recovery/auto-reforecast/RAG engine; AcceptDateSlip без Must AC/SM; OQs still open; EQ mechanism не зафиксирован как Must  
4. `apps/**` отсутствует; нет новых ADR  
5. Sync/archive + `openspec validate --specs --strict` — PASS  
6. Docs post-archive path sync — эта волна

## Вне scope этой работы

Nest/Next scaffold; UI; PostgreSQL; закрытие BA-OQ/HIP; выбор EQ switch mechanism.  
~~Apply OpenSpec → living specs~~ / ~~archive~~ — **выполнено**.
