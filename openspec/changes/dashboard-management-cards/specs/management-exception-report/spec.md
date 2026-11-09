## MODIFIED Requirements

### Requirement: Decision register honesty (Demo v1 read model)

> **certainty:** assumption — dashboard-management-cards 2026-11-09

Система SHALL представлять Decision в реестре с **двумя** явными измерениями в колонке «Статус»: (1) **Исполнение** (`unknown` \| `not_started` \| `in_progress` \| `completed`) из read-only demo observations; (2) **Состояние срока** (`none` \| `upcoming` \| `passed` + FE «Сегодня» при dueDate==asOf). Колонка «Срок» SHALL содержать **только** дату или «—». Система SHALL NOT трактовать прошедший срок как неисполнение. Система SHALL NOT выводить % complete из RAG вехи. `decisionHonesty.recoveryExecuted` SHALL оставаться `false` при recorded (deprecated BR-006 legacy; не статус исполнения). Запись Decision SHALL NOT сама устранять отклонение прогноза (BR-006).

#### Scenario: Past dueDate is calendar, not execution failure

- **WHEN** Decision имеет `dueDate` раньше `scenarioAsOfDate`
- **THEN** dueState=`passed` с подписью состояния срока «Срок прошёл» внутри колонки Статус
- **AND** колонка Срок показывает только дату
- **AND** executionStatus остаётся независимым (может быть unknown/not_started/in_progress/completed)

#### Scenario: Demo execution observation for DEC-001

- **WHEN** snapshot 06 и DEC-001 присутствует в snapshot.decisions
- **THEN** executionStatus=`not_started` с source.kind=`demo` и evidence «Действия не начаты»
- **WHEN** snapshot 07–14
- **THEN** executionStatus=`in_progress` (I не completed)
- **WHEN** snapshot 15–19
- **THEN** executionStatus=`completed` и residual PS Δ MAY оставаться >0

#### Scenario: Decisions without observations stay unknown

- **WHEN** Decision id не имеет видимой observation на snapshot
- **THEN** executionStatus=`unknown` и UI «Нет данных» / «Нет данных об исполнении»

#### Scenario: dueDate equals asOf is not passed

- **WHEN** Decision `dueDate` равен `scenarioAsOfDate`
- **THEN** dueState=`upcoming` и badge состояния срока «Сегодня»

#### Scenario: Milestone title from snapshot

- **WHEN** Decision привязан к milestone в snapshot
- **THEN** register item exposes milestoneName

#### Scenario: Portfolio context for PRT-01

- **WHEN** Decision.projectId = PRT-01
- **THEN** UI ссылается на портфельный dashboard `/`, не на `/projects/PRT-01`

## ADDED Requirements

### Requirement: Dashboard decision panel is PS-driver signal

Система SHALL показывать карточку «Прогноз и решение» только для PS-driver spine (EQ-HVAC-01 / RISK-001 / MS-PS / DEC-001). `decisionPanelState` SHALL быть `recorded` только при наличии DEC-001 в snapshot; `needed` при отсутствии DEC-001 и открытой PS-проблеме с Delayed EQ; иначе `absent`. UI SHALL NOT использовать `topExceptions[0]` как причину.

#### Scenario: Other decisions do not mask missing DEC-001

- **WHEN** snapshot содержит Decision ≠ DEC-001 и DEC-001 отсутствует, а EQ Delayed + PS issue open/mitigating
- **THEN** decisionPanelState=`needed`

### Requirement: Attention critical contour is inset border-box (draft)

> **certainty:** assumption — dashboard-card-composition 2026-11-09

Система SHALL рисовать critical item в «Требует внимания» контуром **внутри** border-box (1px `border` / inset ring на `--status-danger-border`) с фоном danger и скруглением. Система SHALL NOT полагаться на outer `ring` как единственный контур у края scrollport. Список SHALL иметь достаточный gutter, чтобы first/last и боковые грани были видимы в покое и при scroll top/end без sticky-масок.

#### Scenario: First and last critical edges remain visible under list scroll

- **WHEN** список исключений прокручен к началу или к концу
- **THEN** верхняя/нижняя и левая/правая грани critical border не обрезаны scrollport'ом (geometry evidence, не только data-attrs)

### Requirement: Snapshot Changes tiles use semantic tone border (draft)

> **certainty:** assumption — dashboard-card-composition 2026-11-09

Система SHALL добавлять thin 1px border к ChangeTile в тон существующему bg: better→ok-border, worse→danger-border, unchangedCritical→warn-border. Empty tiles SHALL оставаться скрытыми.

### Requirement: Decision panel one control-object composition (draft)

> **certainty:** assumption — dashboard-card-composition 2026-11-09

Система SHALL композировать «Прогноз и решение» как **один** объект контроля («Запуск производства» один раз), с метрикой Δ + подписанными baseline/forecast датами, короткой причиной, и при `recorded` — нейтральной группой «Связанное решение» для DEC-001 (type/note, Исполнение, demo source+asOf). Footer CTA SHALL оставаться достижимым на 768 (inner scroll допустим). Система SHALL NOT дублировать реестр решений и SHALL NOT маскировать `source.kind=demo` под verified action.

#### Scenario: Needed has callout without related-decision group

- **WHEN** decisionPanelState=`needed`
- **THEN** UI показывает «Требуется решение» и SHALL NOT показывать блок «Связанное решение»
