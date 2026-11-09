## ADDED Requirements

### Requirement: Snapshot id space 01 through 19

Selectable Demo snapshots SHALL быть 01–19 (19). Invalid stored snapshot id SHALL fall back to 01. Atomic switch, stale rejection, and sessionStorage committed snapshot semantics SHALL сохраняться.

#### Scenario: Invalid session id falls back to A

- **WHEN** sessionStorage содержит неизвестный snapshot id
- **THEN** bootstrap загружает Snapshot 01

### Requirement: Phase-grouped snapshot selector

UI Snapshot selector SHALL поддерживать phase-grouped scrollable accessible listbox for 01–19 without embedding a Gantt/timeline in the AppBar. Portal behavior SHALL avoid shell clipping.

#### Scenario: Keyboard reaches snapshot 19

- **WHEN** listbox открыт и пользователь нажимает End
- **THEN** фокус/выделение достигает Snapshot 19

### Requirement: Forbidden modeling in R2

Demo v1 R2 SHALL NOT добавлять PostgreSQL, auth, Activity entity engine, CPM/dependency engine, full WBS, Contractors/invoices/GL, HRIS, or EVM indices (PV/EV/CPI/SPI) without separate approved prerequisites. BA-015 forbidden edges remain: Equipment→Milestone; Decision→Equipment/Issue/Risk.

#### Scenario: Architecture guard still blocks FE mock imports

- **WHEN** запускается FE architecture guard
- **THEN** импорты Nest mock modules во frontend запрещены
