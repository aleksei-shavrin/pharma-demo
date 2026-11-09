# milestone-readiness Specification (delta)

## ADDED Requirements

### Requirement: One milestone id is visible in every view that names it

Каталог SHALL хранить каждую веху один раз. Признак `portfolioVisible` и поля `programId` / `projectId` SHALL задаваться независимо. Подборка портфеля SHALL оставаться текущими 12 ID, включая `MS-CLN-PANEL`, `MS-UTL-PWR` и `MS-PS`. Даты и RAG этих вех на снимках 01–19 SHALL NOT меняться этим требованием.

#### Scenario: Portfolio set stays twelve

- **WHEN** программа не выбрана
- **THEN** шкала содержит ровно прежние 12 ID
- **AND** прогноз `MS-CLN-PANEL` на 03–19 равен `2027-03-09`
- **AND** прогноз `MS-UTL-PWR` на 03–19 равен `2027-04-15`
- **AND** прогноз `MS-PS` на C, D и F равен `2027-10-06`
