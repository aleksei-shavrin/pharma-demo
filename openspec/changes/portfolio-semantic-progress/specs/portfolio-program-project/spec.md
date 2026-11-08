## ADDED Requirements

### Requirement: Projects and programs list progress columns

Списки `/projects` и `/programs` SHALL показывать колонку «Прогресс» (track + percent) и отдельную колонку «Завершено» (`completed/total`) сразу после названия. Порядок колонок projects: Код, Проект, Прогресс, Завершено, Статус, Программа, Ответственный. Programs: Код, Программа, Прогресс, Завершено, Статус, Ответственные, Проекты. «Проекты» SHALL оставаться числом проектов, не completed leaves. Заголовок «Завершено» SHALL пояснять (title/aria) «Завершённые работы и контрольные точки / всего».

#### Scenario: Projects column order
- **WHEN** открыт `/projects` на populated snapshot
- **THEN** заголовки идут в порядке Код → Проект → Прогресс → Завершено → Статус → Программа → Ответственный

### Requirement: Portfolio progress fill matches schedule semantics

`progressFillTone` для analyst project на снимке SHALL вычисляться теми же правилами, что fill строки `project_group` в schedule (warning lag/shift + status), для того же snapshot. Цвет SHALL NOT выводиться из percent и SHALL NOT копировать portfolio status RAG вслепую. При `leafTotal = 0` progressPct SHALL быть null и UI SHALL NOT рисовать fake 0% fill.

#### Scenario: Yellow status may have danger fill
- **WHEN** у проекта status Yellow, но schedule warning fold даёт lag
- **THEN** `progressFillTone` равен `danger`
- **AND** status pill остаётся Yellow

### Requirement: Program leaf progress is a sum not a mean

Program `leafCompleted`/`leafTotal` SHALL быть суммой метрик дочерних проектов. Program `progressPct` SHALL быть `round(sumCompleted/sumTotal*100)` при sumTotal>0, иначе null. Program fillTone SHALL согласовываться с fold warning по листьям member projects.

#### Scenario: Program does not average percents
- **WHEN** два проекта 0/10 и 10/10
- **THEN** program leaf totals 10/20 и progressPct 50
- **AND** не 50 как среднее (0+100)/2 отдельно от сумм
