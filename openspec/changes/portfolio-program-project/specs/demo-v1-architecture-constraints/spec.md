# demo-v1-architecture-constraints Specification (delta)

## ADDED Requirements

### Requirement: Analyst projects are a read-model inside PRJ-01

Demo v1 MAY отдавать программы и проекты аналитика как read-model внутри контейнера `PRJ-01`. Это SHALL NOT вводить Domain entity WBS, Activity или Task и SHALL NOT заменять Schedule `PRJ-01`. Прямое ребро Equipment→Milestone по-прежнему запрещено.

#### Scenario: Panel equipment does not gain a milestone edge

- **WHEN** читаются связи `EQ-CLN-01` на снимке D
- **THEN** среди них нет Equipment→Milestone
- **AND** `ISS-CLN-01` по-прежнему ссылается на `MS-CLN-RDY`
