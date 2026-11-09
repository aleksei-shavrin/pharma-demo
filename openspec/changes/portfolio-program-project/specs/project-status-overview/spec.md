# project-status-overview Specification (delta)

## ADDED Requirements

### Requirement: Portfolio wording and program status block

Обзор SHALL называть состояние и дату запуска данными портфеля `PRT-01`. Правый блок SHALL называться «Состояние по программам» и перечислять семь программ. Он SHALL NOT называться «Готовность направлений» и SHALL NOT перечислять `WS-*` как программы. Правило статуса самого `PRT-01` не меняется: Red при `MS-PS` Red или `RISK-001` Red.

#### Scenario: Snapshot 03 header is the portfolio

- **WHEN** открыт обзор на снимке 03 без выбранной программы
- **THEN** дата запуска читается как дата портфеля `2027-10-06`
- **AND** правый блок показывает семь программ, а не восемь направлений
