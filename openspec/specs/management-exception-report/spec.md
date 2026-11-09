# management-exception-report Specification

## Purpose

Предоставляет директору согласованный impact aggregate и запись управленческого Decision. Основной Must workflow C-05 — PrioritizeRecovery; AcceptDateSlip не является обязательным пользовательским сценарием и не получает state machine.

## Requirements

### Requirement: Impact aggregate matches source objects

Система SHALL предоставлять агрегированные данные: baseline/forecast production start, milestone rag, contributing equipment id; для Snapshot 02/C — ссылки на top risk и issue — согласованные с исходными объектами без смешения delivery dates и production-start dates (REQ-IMPCT-001; BR-005).

#### Scenario: Aggregate production-start fields match Project and Milestone

- **WHEN** запрашивается director impact aggregate
- **THEN** baselineProductionStart и forecastProductionStart совпадают с Project
- **AND** forecastProductionStart совпадает с MS-PS.forecastDate
- **AND** milestone rag совпадает с MS-PS.rag

#### Scenario: Aggregate equipment delivery separate from production start

- **WHEN** запрашивается director impact aggregate
- **THEN** aggregate содержит ссылку на EQ-HVAC-01 и отражает Equipment baselineDelivery и forecastDelivery
- **AND** delivery dates не трактуются как production-start dates

### Requirement: AcceptDateSlip is known Decision type without Must workflow

Система SHALL допускать запись Decision type AcceptDateSlip как известный тип без обязательного Must user journey. Спецификация SHALL NOT определять Issue/Risk/Milestone post-state после AcceptDateSlip (BA-OQ-004/005 open). Если такой Decision записан, forecast PRJ/MS SHALL NOT меняться относительно Snapshot 02 только из факта записи (REQ-IMPCT-002).

#### Scenario: AcceptDateSlip not a Must user journey

- **WHEN** оценивается Must Demo v1 director workflow
- **THEN** обязательный путь — PrioritizeRecovery
- **AND** AcceptDateSlip не требует полноценных AC post-state Issue/Risk/MS

#### Scenario: AcceptDateSlip does not change forecast by itself

- **WHEN** записан Decision type AcceptDateSlip
- **THEN** forecast PRJ/MS остаётся как в Snapshot 02
- **AND** Issue.status, Risk.rag и Milestone.rag после этого Decision не определяются этой спецификацией

### Requirement: No UI layout prescription

Requirements этой capability SHALL NOT предписывать конкретный UI layout impact screens (REQ-IMPCT-001). Presentation Issues & Risks register для Demo v1 resolved вне этой capability: единый register + колонка `Тип` (BA-OQ-006 **closed**, DOC-BA-010); Domain Issue/Risk остаются раздельными.

#### Scenario: Behavior without layout

- **WHEN** проверяются acceptance criteria impact/decision
- **THEN** критерии не требуют конкретного UI layout impact screens
- **AND** критерии не объединяют Issue и Risk в одну Domain entity

### Requirement: No GMP change workflow for Decision

Запись Decision SHALL NOT требовать GMP change workflow (REQ-IMPCT-002).

#### Scenario: Decision without GMP workflow

- **WHEN** записывается PrioritizeRecovery
- **THEN** GMP change workflow не требуется

### Requirement: Top management exceptions list

Система SHALL предоставлять упорядоченный список topExceptions (целевой размер 3–5) на dashboard/read model. Ordering MAY use read-model `priority` (curated Demo order). SHALL NOT добавлять managementPriority на Domain entities Issue/Risk/Equipment/Milestone.

#### Scenario: Snapshot 05 returns multiple exceptions with read-model order

- **WHEN** запрашивается director overview для Snapshot 05
- **THEN** доступны ≥2 exception entries including HVAC→PS spine
- **AND** порядок соответствует curated read-model priority

### Requirement: Trend since previous snapshot

Система SHALL предоставлять fixture-authored trend: better[], worse[], unchangedCritical[] (или эквивалент) без temporal analytics engine. FE только отображает.

#### Scenario: Snapshot 07 trend reflects packaging recovery

- **WHEN** активен Snapshot 07
- **THEN** better[] указывает улучшение packaging story
- **AND** unchangedCritical[] может содержать HVAC/PS residual

### Requirement: Multiple decisions with Project and Milestone only

Система SHALL допускать несколько Decision records с projectId и optional milestoneId. Decision SHALL NOT иметь Domain links to Equipment, Issue, or Risk. Decision alone SHALL NOT менять forecast (BR-006).

#### Scenario: Snapshot 06 has DEC-001 without forecast heal

- **WHEN** активен Snapshot 06 с DEC-001
- **THEN** forecastProductionStart остаётся 2027-10-06
- **AND** DEC-001 связан с Project PRT-01 и Milestone MS-PS
- **AND** Decision links не включают Equipment, Issue или Risk as Domain edges

### Requirement: Aggregate Issue and Risk refs by enriched snapshots

В Snapshot 03/F aggregate SHALL содержать ссылки на RISK-001 и ISS-001. В Snapshot 01 открытый ISS-001 не требуется.

#### Scenario: Snapshot 03/06 require RISK and ISS refs

- **WHEN** активен Snapshot 03 или 06
- **THEN** aggregate содержит ссылки на RISK-001 и ISS-001

#### Scenario: Snapshot 01 does not require ISS-001

- **WHEN** активен Snapshot 01
- **THEN** ссылка на открытый ISS-001 не требуется

### Requirement: BR-007 state-based integrity

Если RISK-001 Red на HVAC→Production Start path, система SHALL NOT показывать MS-PS Green. Применимо к любому snapshot (включая residual 07/08).

#### Scenario: Snapshot 07/08 causal integrity

- **WHEN** активен Snapshot 07 или 08 с RISK-001 Red
- **THEN** MS-PS не является Green

#### Scenario: Snapshot 01 baseline integrity only

- **WHEN** активен Snapshot 01
- **THEN** полная Issue causal chain не требуется и baseline integrity соблюдается

### Requirement: Record PrioritizeRecovery Decision on Snapshot 06

Система SHALL позволять DEC-001 PrioritizeRecovery на Snapshot 06; Issue → Mitigating отражает запись Decision; forecast остаётся 2027-10-06 (BR-006).

#### Scenario: Primary Snapshot 06 PrioritizeRecovery

- **WHEN** директор фиксирует PrioritizeRecovery как DEC-001 в Snapshot 06
- **THEN** существует DEC-001 type PrioritizeRecovery с projectId PRT-01 и milestoneId MS-PS
- **AND** forecast PRJ/MS остаётся 2027-10-06
- **AND** ISS-001 Mitigating без recovery execution
- **AND** auto-reforecast не выполняется

### Requirement: Decision register honesty (Demo v1 read model)

> **certainty:** assumption — dashboard-management-cards 2026-11-09

Система SHALL представлять Decision в реестре с двумя измерениями в колонке «Статус»: **Исполнение** (`unknown`\|`not_started`\|`in_progress`\|`completed` из demo observations) и **Состояние срока** (`none`\|`upcoming`\|`passed`; FE «Сегодня» при dueDate==asOf). Колонка «Срок» SHALL содержать только дату или «—». `projectId=PRT-01` SHALL = портфель. SHALL NOT трактовать прошедший срок как неисполнение. SHALL NOT выводить % complete из RAG. `decisionHonesty.recoveryExecuted` SHALL оставаться deprecated always-false; BR-006: запись не устраняет отклонение. Register item SHALL включать `milestoneName`.

#### Scenario: Past dueDate is calendar, not execution failure

- **WHEN** Decision имеет `dueDate` раньше `scenarioAsOfDate`
- **THEN** dueState=`passed` с подписью состояния срока в колонке Статус
- **AND** колонка Срок показывает только дату
- **AND** executionStatus независим

#### Scenario: Demo execution observation for DEC-001

- **WHEN** snapshot 06 с DEC-001
- **THEN** executionStatus=`not_started`, source.kind=`demo`, evidence «Действия не начаты»
- **WHEN** snapshot 07–14
- **THEN** executionStatus=`in_progress`
- **WHEN** snapshot 15–19
- **THEN** executionStatus=`completed`; residual PS Δ MAY >0

#### Scenario: dueDate equals asOf is not passed

- **WHEN** Decision `dueDate` равен `scenarioAsOfDate`
- **THEN** dueState=`upcoming` и badge состояния срока «Сегодня»

#### Scenario: Milestone title from snapshot

- **WHEN** Decision привязан к milestone в snapshot
- **THEN** register item exposes milestoneName

#### Scenario: Portfolio context for PRT-01

- **WHEN** Decision.projectId = PRT-01
- **THEN** UI ссылается на портфельный dashboard `/`, не на `/projects/PRT-01`
- **AND** program/AN context только из canonical milestone membership
