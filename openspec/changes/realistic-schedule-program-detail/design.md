# Design: master-schedule + program detail

## Windows (assumption, content-based) — r2/r3

Content `workDays` 6–10 by AN; forward CPM; **slide** so `terminalBaselineMax ≤ 2027-09-15` (no scale). Soft `window.end` preferred. `optionalPostLaunchWbs = []`. See `PROJECT_BASELINE_WINDOWS` in code. `sourceWeeks` = delay mark only.

## Realized timeline (r4)

Один immutable timeline: baseline CPM → crisis event (asOf 03 **2027-03-01**, +21 на незавершённый HVAC seed) с topo FS/SS/FF/SF → recovery slide open suffix к launch **2027-09-22**. Facts, завершённые до кризиса, не двигаются. Forecast C **10-06** остаётся на forecast plane. Raw emoji = provenance.

## Conflict priority

P0 narrative dates → P1 link chronology → P2 windows → P3 raw status metadata (provenance) → P4 legacy synthetic.

Cycles / incompatible constraints: keep link; audit row; schedule with documented break (topo ignore back-edge). CPM edges используют ту же stage-boundary projection, что runtime LNK-A.

## P0 HVAC vs PS

MS-PS baseline **2027-09-15**; C forecast **2027-10-06**; S actual launch **2027-09-22**.
EQ-HVAC-01 deliveredOn **2027-06-05** (было synthetic **2027-09-20** после IQ) = catalog baseline 05-15 + crisis +21; до MS-HVAC-IQ **2027-06-15**. Та же AHU long-lead.

## Program milestones

Program/project detail milestones = catalog MS ∪ imported+aliased KT (lifecycle dates/status). `GET .../milestones/KT-*` resolves via schedule checkpoints (not broken 404).

## Program cost

UI: «Резерв портфеля не входит в бюджет программы» (без внутренней реализации).

Технически: сумма `DEMO_WORKSTREAM_CBS` через `WORKSTREAM_BRIDGES.programId`; каждый WS учитывается один раз на PRG (без double-count); `null`, если у членов нет WS cost; portfolio reserve не входит в budget программы.

## Edge audit (r4b)

Строгие числа разделены:

| Метрика | Смысл |
|---|---|
| `temporalEdgesChecked` | Leaf links с временным контрактом baseline/forecast/actual (lag=0): scheduling typed + imported `cross_project_predecessor` (analyst ⇢ → `LNK-X-####`, FS как в `buildAnalystFsEdges`) |
| `topologyOnlySkipped` | Без temporal semantics: curated demo `LNK-X-PWR-HVAC` / `LNK-X-PANEL-CLN` (reason `curated_demo_cross_no_planning_type`); group endpoints (`group_endpoint_no_interval`) |
| `edgesUnresolved` | Missing leaf refs |

Critical seams (→) уже в `scheduling` / LNK-A и входят в temporal. Нельзя skip всех 133 cross ради 0 violations.
