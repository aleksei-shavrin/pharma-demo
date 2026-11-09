## ADDED Requirements

### Requirement: Exceptions and trend across 01–19

Top exceptions и trend (`better` / `worse` / `unchangedCritical`) SHALL оставаться fixture-authored read-model shapes for snapshots 01–19. FE SHALL NOT infer exception priority as Domain field.

#### Scenario: Snapshot 17 baseline date honesty exception

- **WHEN** активен Snapshot 17 (asOf = baseline PS date without start)
- **THEN** exceptions/trend отражают calendar honesty without claiming Production Start achieved

### Requirement: Notifications do not replace exceptions

Notification tray SHALL NOT заменить Top Exceptions panel. Notifications MAY deep-link to the same entities but remain non-authoritative.

#### Scenario: Dashboard exceptions remain after toast

- **WHEN** snapshot switch показывает toast
- **THEN** Top Exceptions panel продолжает отображать backend topExceptions для committed snapshot
