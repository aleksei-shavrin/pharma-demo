# portfolio-program-project Specification (delta)

## ADDED Requirements

### Requirement: Portfolio container keeps PRT-01

Демонстрационный портфель SHALL быть тем же `PRT-01`. Новые ID программ и проектов аналитика SHALL NOT заменять `PRT-01` в контрактах `MS-PS`, `DEC-001` и HVAC.

#### Scenario: Production start identity is unchanged

- **WHEN** читается обзор на снимке 03, 04 или 06
- **THEN** прогноз запуска `PRT-01` равен `2027-10-06`
- **AND** `DEC-001` на 06 по-прежнему ссылается на `PRT-01` и `MS-PS`

### Requirement: Seven programs and twenty-five analyst projects

Система SHALL отдавать семь программ и каталог `AN-01`…`AN-25` с членством из отчёта A01. Подробный сюжет SHALL быть только у `AN-06`, `AN-07`, `AN-08`, `AN-09`, `AN-24`.

#### Scenario: Construction membership

- **WHEN** читается программа `PRG-CON`
- **THEN** в ней проекты `AN-06`, `AN-07`, `AN-08`
- **AND** `AN-08` связан с `ISS-CLN-01`, `EQ-CLN-01`, `MS-CLN-PANEL` и `MS-CLN-RDY`
- **AND** текст не называет сдвиг поставки `EQ-CLN-01` причиной отставания монтажа

#### Scenario: Engineering membership

- **WHEN** читается программа `PRG-ENG`
- **THEN** в ней проекты `AN-09`, `AN-10`, `AN-11`, `AN-12`, `AN-24`
- **AND** `AN-09` несёт существующий HVAC-сюжет, `AN-24` — `MS-UTL-PWR`

### Requirement: Thin rows do not hide a source lag

У проекта без подробного сюжета SHALL быть признак `sourceAttention`. Он равен `lag`, если в блоке исходника есть ⚠️ или ❌, и `none`, если таких отметок нет. `lag` SHALL NOT отображаться как Green. Отсутствие недель, владельца и проблемы SHALL NOT само по себе делать строку зелёной.

Проекты с `sourceAttention = lag` и без подробного сюжета: `AN-01`…`AN-05`, `AN-10`…`AN-14`, `AN-16`…`AN-19`, `AN-22`. Проекты с `sourceAttention = none`: `AN-15`, `AN-20`, `AN-21`, `AN-23`, `AN-25`.

#### Scenario: Design projects stay in attention

- **WHEN** читается каталог на любом снимке 01–19
- **THEN** `AN-01`…`AN-05` имеют статус Yellow
- **AND** у них нет выдуманного числа недель отставания

#### Scenario: IT infrastructure may be green

- **WHEN** читается `AN-15`
- **THEN** статус Green
- **AND** в исходном блоке 15 нет ⚠️ и ❌

### Requirement: Program status follows member projects

Статус программы SHALL быть Red, если хотя бы один проект Red; иначе Yellow, если хотя бы один Yellow; иначе Green. Пустой набор вех SHALL NOT делать программу Green.

#### Scenario: Design program is yellow without milestones

- **WHEN** выбрана `PRG-DSN`
- **THEN** статус программы Yellow
- **AND** набор вех программы пуст

#### Scenario: Construction is red when panels are red

- **WHEN** активен снимок 03 и читается `PRG-CON`
- **THEN** `AN-08` Red, `AN-06` и `AN-07` Yellow
- **AND** статус `PRG-CON` равен Red

### Requirement: Milestone membership is separate from portfolio visibility

У вехи SHALL быть один ID. Принадлежность (`programId`, `projectId`) SHALL NOT заменяться флагом видимости. Видимость портфельной подборки — отдельный признак `portfolioVisible`. Шкала без выбранной программы показывает вехи с `portfolioVisible`. Шкала выбранной программы показывает вехи с этим `programId`, включая те, у которых `portfolioVisible` тоже истинен. Все три рендерера SHALL получать один и тот же список точек выбранного представления.

#### Scenario: Panels appear in both views

- **WHEN** сравниваются портфельная шкала и шкала `PRG-CON`
- **THEN** `MS-CLN-PANEL` есть в обоих наборах под тем же ID
- **AND** `MS-PS` есть только в портфельной шкале

#### Scenario: Power appears in both views

- **WHEN** сравниваются портфельная шкала и шкала `PRG-ENG`
- **THEN** `MS-UTL-PWR` есть в обоих наборах под тем же ID

#### Scenario: Empty program scale is not the portfolio set

- **WHEN** выбрана `PRG-DSN`
- **THEN** все три рендерера получают пустой список вех
- **AND** подборка из 12 не подставляется

### Requirement: Attention filter and unknown ids

Состав программы SHALL фильтроваться признаком «Требует внимания»: статус проекта Yellow или Red. Сброс фильтра SHALL возвращать полный список. Неизвестный ID программы или проекта SHALL отдавать отказ «Запись не найдена в этом снимке», без пустой карточки.

#### Scenario: Filter hides green IT row inside a mixed program

- **WHEN** в составе `PRG-DIG` включён фильтр «Требует внимания»
- **THEN** `AN-15` скрыт
- **AND** `AN-16`, `AN-17`, `AN-18` видны
- **AND** после сброса снова видны все четыре

#### Scenario: Unknown project

- **WHEN** запрашивается `AN-99`
- **THEN** ответ — запись не найдена в этом снимке

### Requirement: Selection query is not navigation

Клик по программе на обзоре SHALL только ставить или снимать query `program` и менять шкалу. Переход на дашборд программы SHALL быть отдельным действием «Перейти к программе». Снимок SHALL храниться в сессии. Смена снимка SHALL NOT снимать выбранную программу и SHALL NOT менять URL страницы программы. Кнопка «Назад» SHALL возвращать предыдущий URL и SHALL NOT восстанавливать предыдущий снимок.

#### Scenario: Back from project keeps the new snapshot

- **WHEN** пользователь открыл карточку из состава, сменил снимок на странице программы и нажал «Назад» с карточки
- **THEN** открывается состав той же программы
- **AND** активен снимок, выбранный последним, а не снимок до перехода в карточку

#### Scenario: Back to overview restores program query

- **WHEN** пользователь пришёл на программу с `/?program=PRG-CON` и возвращается на обзор кнопкой «Назад»
- **THEN** query `program=PRG-CON` восстановлен
- **AND** шкала снова показывает вехи `PRG-CON`
