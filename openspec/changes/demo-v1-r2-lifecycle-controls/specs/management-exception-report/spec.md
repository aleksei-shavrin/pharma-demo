## ADDED Requirements

### Requirement: Exceptions and trend across A–S

Top exceptions и trend (`better` / `worse` / `unchangedCritical`) SHALL оставаться fixture-authored read-model shapes for snapshots A–S. FE SHALL NOT infer exception priority as Domain field.

#### Scenario: Snapshot Q baseline date honesty exception

- **WHEN** активен Snapshot Q (asOf = baseline PS date without start)
- **THEN** exceptions/trend отражают calendar honesty without claiming Production Start achieved

### Requirement: Notifications do not replace exceptions

Notification tray SHALL NOT заменить Top Exceptions panel. Notifications MAY deep-link to the same entities but remain non-authoritative.

#### Scenario: Dashboard exceptions remain after toast

- **WHEN** snapshot switch показывает toast
- **THEN** Top Exceptions panel продолжает отображать backend topExceptions для committed snapshot
