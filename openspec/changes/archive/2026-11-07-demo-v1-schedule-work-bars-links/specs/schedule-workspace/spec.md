# schedule-workspace Specification (delta)

## Purpose

Контракт и поведение рабочего пространства Schedule Demo v1: контрольные точки, curated интервальные работы, семантические статусы и read-only типизированные зависимости. Не scheduling engine.

> Демо-контракт согласован 2026-11-06. Curated fixture rows — после ответа аналитика.

## ADDED Requirements

### Requirement: Schedule items include curated work rows

Schedule API SHALL допускать items с `kind: 'work'` наряду с `equipment_delivery` и `milestone`. Work SHALL NOT вводить Domain entity Activity / Task / WBS. Work `id` SHALL использовать исходный идентификатор аналитика, когда он уникален и стабилен; presentation / link refs SHALL использовать форму `work:<id>`.

#### Scenario: Work row shape

- **WHEN** клиент запрашивает schedule для снимка с curated works
- **THEN** ответ может содержать items с `kind: 'work'`
- **AND** каждый work имеет `id`, `name`, `startDate`, `endDate`, `status`
- **AND** Domain catalogue не добавляет Activity/Task/WBS entity

### Requirement: Work interval is a single forecast bar

Система SHALL кодировать одну полосу работы полями `startDate` и `endDate` как **прогнозный** интервал в **календарных** днях. Система SHALL трактовать `endDate` как **включительную** календарную дату. Система SHALL NOT в этом этапе рисовать dual-bar baseline+fact на строке work.

#### Scenario: Inclusive end maps to visible span

- **WHEN** work имеет `startDate` = D1 и `endDate` = D2 (D2 ≥ D1)
- **THEN** полоса покрывает календарные дни от D1 до D2 включительно

#### Scenario: Same-day work remains a one-day bar

- **WHEN** work имеет `startDate` равный `endDate`
- **THEN** UI показывает видимую полосу длиной в один календарный день
- **AND** строка не рендерится как zero-duration milestone

### Requirement: Work status enum and visible text

Система SHALL использовать статус работы из множества `Waiting` | `OnSchedule` | `Delayed` | `Completed` с русскими подписями Ожидание / По графику / Отстаёт / Выполнено. Система SHALL NOT использовать параллельные коды `InProgress` и `OnTrack` в этом контракте. Статус SHALL быть задан в данных снимка (authored); система SHALL NOT требовать расчёта статуса от `scenarioAsOfDate` для G07–G11.

#### Scenario: Status readable without color alone

- **WHEN** пользователь смотрит строку work в таблице
- **THEN** отображается русская подпись статуса
- **AND** цвет полосы согласован с semantic tokens статуса

### Requirement: Typed display-only dependency links between works

Schedule API SHALL включать `links` — массив зависимостей с `id`, `sourceRef`, `targetRef`, `type` ∈ {`FS`,`SS`,`FF`,`SF`}. `sourceRef` и `targetRef` SHALL иметь вид `work:<entityId>`. Концы SHALL ссылаться на существующие work items того же ответа. Система SHALL отображать links read-only и SHALL NOT создавать/редактировать их в UI. Система SHALL NOT в G07–G11 допускать ends на `milestone` или `equipment_delivery`.

#### Scenario: Four link types present in demo fixture set

- **WHEN** загружен согласованный демо-снимок с зависимостями
- **THEN** среди links представлены типы FS, SS, FF и SF
- **AND** каждый конец резолвится в work item

#### Scenario: Snapshot without works keeps control-point markers

- **WHEN** schedule снимка не содержит work items и links пуст
- **THEN** milestone и equipment_delivery продолжают отображаться точечными маркерами как до G07–G11
