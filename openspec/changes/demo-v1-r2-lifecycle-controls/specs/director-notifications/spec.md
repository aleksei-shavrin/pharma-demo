## ADDED Requirements

### Requirement: Notification read model

Система SHALL предоставлять Notification read-model entries с полями `id`, `snapshotId`, `severity`, `taxonomy`, `titleRu`, optional `bodyRu`, optional `href`, optional `entityRefs`. Taxonomy SHALL включать как минимум: `critical_risk`, `issue`, `milestone`, `cost`, `decision`, `recovery`, `readiness`. Notifications SHALL NOT быть source of truth и SHALL NOT изменять Risk/Issue/Milestone/Cost state.

#### Scenario: Notifications scoped to committed snapshot

- **WHEN** committed snapshot = C
- **THEN** notification list отражает только entries с `snapshotId = C` (или explicit multi-snapshot design that still keys off committed id without mutating domain)

### Requirement: Snapshot switch toast budget

После **успешного** atomic snapshot commit клиент MAY показать не более трёх contextual toasts. При failed или stale switch клиент SHALL NOT показывать toasts от неуспешного запроса.

#### Scenario: Stale response yields no toast

- **WHEN** запрос C завершается после успешного commit G
- **THEN** UI не показывает toasts для устаревшего ответа C

### Requirement: Toast placement and semantic severity presentation

Toast stack SHALL render **top-right** below the AppBar safe offset and SHALL present subtle semantic surfaces from authoritative `severity` (critical→danger, attention→warn) with positive `info`+`recovery`/`readiness`→success and other `info`→neutral. Placement and color presentation SHALL NOT alter N1 storage, budget, or stale/fail toast suppression semantics.

#### Scenario: Top-right semantic stack after successful commit

- **WHEN** popup preference is on and a successful atomic snapshot commit yields notifications
- **THEN** ≤3 toasts appear top-right with severity-mapped surfaces and do not cover AppBar controls

### Requirement: Notification preference and read storage

Popup preference «Показывать уведомления при смене снимка» SHALL храниться в **localStorage**. Read/unread state SHALL храниться в **sessionStorage**. Snapshot id persistence SHALL остаться в существующем sessionStorage ключе snapshot semantics.

#### Scenario: Preference survives reload

- **WHEN** пользователь выключает popup preference и перезагружает страницу
- **THEN** preference остаётся выключенной (localStorage), а read/unread может сброситься с session (sessionStorage)
