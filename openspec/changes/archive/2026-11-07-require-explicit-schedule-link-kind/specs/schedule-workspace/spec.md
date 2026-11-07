# schedule-workspace Specification (delta)

## MODIFIED Requirements

### Requirement: Typed display-only dependency links between works

Schedule API SHALL включать `links`. Для связей с явным `kind: scheduling` SHALL быть `id`, `sourceRef`, `targetRef`, `type` ∈ {`FS`,`SS`,`FF`,`SF`} с концами `work:<entityId>` того же ответа. Links SHALL быть read-only в UI. Scheduling-связи SHALL NOT иметь ends на `milestone` или `equipment_delivery`. Kind `cross_project_predecessor` SHALL следовать Milestone to work link is an untyped cross-project predecessor. Система SHALL NOT публиковать scheduling link без явного `kind`.

#### Scenario: Four link types present in demo fixture set

- **WHEN** загружен согласованный демо-снимок с scheduling-зависимостями
- **THEN** среди scheduling links представлены типы FS, SS, FF и SF
- **AND** каждый конец резолвится в work item
- **AND** у каждой scheduling-связи задан явный `kind: scheduling`

#### Scenario: Snapshot without works keeps control-point markers

- **WHEN** schedule снимка не содержит work items и scheduling links пуст
- **THEN** milestone и equipment_delivery продолжают отображаться точечными маркерами как до G07–G11
