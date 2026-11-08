---
id: DOC-PROD-012
title: Demo v1 — mock narrative data
type: product
status: draft
version: 0.5.8
created: '2026-10-30'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-PROD-011
  - DOC-PROD-020
  - DOC-PROD-021
  - DOC-BA-014
  - DOC-BA-015
  - DOC-DISC-018
---
# Demo v1 mock narrative data

Согласованный dataset для SCN-001→SCN-007. Certainty: **assumption** (демо-данные, не данные заказчика).

## Временная рамка

| Параметр | Значение |
|----------|----------|
| Дата подготовки пакета (документация) | 2026-10-30 |
| Календарь narrative | **2027** (будущее относительно подготовки) |
| Задержка critical equipment | **+21 календарный день** (Δ) |

> **certainty:** assumption
>
> История не описывает «уже прошедшие» относительно подготовки события сентября 2026; `scenarioAsOfDate` задаёт «сейчас» внутри демо-мира для каждого snapshot.

## Narrative condition (не BR)

| ID | Условие |
|----|---------|
| **NC-001** | В Snapshot B (и C) существует Issue **ISS-001**, status Open (B) / Mitigating (C при PrioritizeRecovery), linked to EQ-HVAC-01 и MS-PS. Это fixture narrative, опирающийся на capability **BR-001**, но не тождественный ему. |

## Snapshot A — Baseline (до задержки)

**scenarioAsOfDate:** 2027-02-15

| Object | Key fields | Rule source |
|--------|------------|-------------|
| Project PRJ-01 | name «Строительство фармацевтической фабрики (Greenfield)»; baselineProductionStart **2027-09-15**; forecastProductionStart **2027-09-15** | stored |
| Milestone MS-PS | «Ready for production»; baseline/forecast **2027-09-15**; rag **Green** (baseline fixture; **не** вывод BR-003) | stored baseline |
| Equipment EQ-HVAC-01 | critical true; projectId PRJ-01; baselineDelivery **2027-05-15**; forecastDelivery **2027-05-15**; status OnTrack | stored |
| Risk RISK-001 | rag **Green** (baseline fixture; **не** вывод BR-002); milestone MS-PS; equipment EQ-HVAC-01; no open delay issue | stored baseline |
| Issue | none open for EQ-HVAC-01 | — |
| Decision | none | — |

## Snapshot B — After delay (SCN-001 recorded)

**scenarioAsOfDate:** 2027-03-01

| Object | Key fields | Rule source |
|--------|------------|-------------|
| EQ-HVAC-01 | forecastDelivery **2027-06-05** (Δ=+21); status Delayed | stored |
| Issue ISS-001 | «HVAC long-lead delivery slip»; status **Open**; owner SH-002; links EQ-HVAC-01, MS-PS | **NC-001** + BR-001 capability |
| RISK-001 | rag **Red** (fixture); links ISS-001, MS-PS, EQ-HVAC-01 | fixture; integrity vs **expected** BR-002 |
| MS-PS | forecast **2027-10-06**; rag **Red** (fixture) | fixture; integrity vs BR-003 + BR-004 |
| PRJ-01 | forecastProductionStart **2027-10-06** | **must satisfy BR-004** |
| Decision | pending | — |

Проверка BR-004: baseline PS 2027-09-15 + 21d = 2027-10-06; EQ 2027-05-15 + 21d = 2027-06-05.

## Snapshot C — Director decision (SCN-007)

**scenarioAsOfDate:** 2027-03-02

| Object | Key fields | Rule source |
|--------|------------|-------------|
| EQ / ISSUE / RISK / MS / PRJ | **как в Snapshot B** (включая forecast 2027-10-06) | BR-006: no auto re-forecast |
| Issue ISS-001 | status **Mitigating** (Decision PrioritizeRecovery recorded; recovery execution is not modeled) | consistent with PrioritizeRecovery / BR-006 |
| Decision DEC-001 | type **PrioritizeRecovery**; ownerRole SH-006; dueDate **2027-03-20**; note «Expedite vendor / alternate lane» | BR-006 |

**Alternative C' (AcceptDateSlip) — только подтверждённое:**

| Object | Confirmed | Open |
|--------|-----------|------|
| Decision DEC-001 | type **AcceptDateSlip**; forecast PRJ/MS **без изменения** (2027-10-06) | — |
| Issue.status | — | **BA-OQ-004** (не авто-Closed; AcceptDateSlip — тип Decision, не Issue.status) |
| Risk.rag / MS.rag | — | **BA-OQ-005** |

Отдельный полный mock snapshot для AcceptDateSlip **не** добавляется (не Must).

## Causal / temporal integrity matrix (BA-Mock-Integrity)

| Check | Snapshot | Expected | Spec Pass |
|-------|----------|----------|-----------|
| Temporal frame 2027; A asOf < B ≤ C | A/B/C | chronology | yes |
| BR-007 **A**: no Open Issue; forecast=baseline; Green = fixture | A | baseline integrity | yes |
| NC-001 ISS-001 | B, C | linked EQ+MS-PS | yes |
| BR-002 / BR-003 expected vs fixture | B, C | Risk/MS Red | yes |
| BR-004 Δ=+21 EQ → MS/PRJ (dates ≠ equal across meanings) | B, C | PS 2027-10-06; EQ delivery 2027-06-05 | yes |
| BR-005 aggregate: PS dates/RAG match PRJ/MS; EQ delivery dates separate; refs ISS/RISK | B, C | consistent | yes |
| BR-006 / BR-007 **C**: no auto-reforecast; no Green MS with Red Risk | C | forecast unchanged | yes |
| Causal chain EQ→ISS→RISK→MS→PRJ | B, C only | present | yes |
| No Activity entity in Demo v1 dataset | A/B/C | absent | yes |

> **certainty:** assumption
>
> Pass — логическая проверка **спецификации** mock data; runtime — later apps.

## Enrichment status

R1 design pack (DOC-PROD-019…022) **approved**. E1 moved public contracts to **collection-shaped** stubs compatible with the enriched timeline (A calm; B local Yellow; C HVAC +21 Red; D–H unpopulated until E2). Full 23/14/11/12/6 A–H inventory remains **E2**.

Authoritative enrichment design:

- [demo-v1-enrichment-scope.md](./demo-v1-enrichment-scope.md)
- [demo-v1-enrichment-fixture-blueprint.md](./demo-v1-enrichment-fixture-blueprint.md)
- [demo-v1-enrichment-snapshot-matrix.md](./demo-v1-enrichment-snapshot-matrix.md)

This document’s historical singular A/B/C narrative above is **superseded for timeline meaning** by DOC-PROD-021/022; keep it only as pre-enrichment reference until E2 replaces stubs.

## Сюжет панелей и энергоснабжения (A01–A05)

> **certainty:** assumption
>
> Демоданные. Календарь исходника аналитика не содержит. Таблица сопоставления и правила дат: [DOC-DEL-A01-A05](../07-delivery/reports/2026-11-06-a01-a05-analyst-mapping.md).

На фикстурном снимке C (`scenarioAsOfDate` **2027-03-01**, не дата 2027-03-02 из исторической таблицы SCN-007 выше) к сюжету HVAC добавляются две контрольные точки:

| ID | Baseline (все снимки) | Прогноз на C | RAG на C |
|----|----------------------|--------------|----------|
| `MS-CLN-PANEL` | 2027-02-16 | 2027-03-09 (+21 день) | Red |
| `MS-UTL-PWR` | 2027-02-18 | 2027-04-15 (+56 дней) | Red |

`MS-PS` остаётся Red с прогнозом 2027-10-06. Связь `EQ-CLN-01` → задержка монтажа панелей не вводится.

> **certainty:** assumption
>
> Демоданные. На B обе вехи ещё Green и delta 0. На C вводится отставание. На D–S те же +21 / +56 и Red удерживаются: прогноз не возвращается к baseline при переходе C → D. Восстановления в исходнике нет. HVAC, `MS-PS` и связи проблем с `MS-CLN-RDY` не меняются.

## Маршрут директора C → D → F (A06–A09)

> **certainty:** assumption
>
> Подробности и пометки демоданных: [DOC-DEL-A06-A09](../07-delivery/reports/2026-11-06-a06-a09-director-scenario.md).

Блок решений меняет состояние без нового поля статуса. На C и D его заголовок — «Требуется решение»: решений нет, `ISS-001` открыт, поставка AHU сдвинута. На F заголовок — «Управленческие решения», в списке `DEC-001` (PrioritizeRecovery, владелец `PER-01`, веха `MS-PS`) с отметкой «Решение записано». Прогноз `MS-PS` на F совпадает с C: `2027-10-06`.

Блок исключений называется «Требует внимания». Его тексты на A–S называют отклонение, проблему или последствие и не повторяют цвет маркера. Числа сценариев те же.

На D директор отдельно видит `ISS-CLN-01` (отставание монтажа, владелец `PER-07`) и `RISK-CLN-01` (неготовность чистых зон к HVAC). Оба связаны с `MS-CLN-RDY`, не с `MS-CLN-PANEL`. Сдвиг поставки `EQ-CLN-01` +14 дня — отдельное демосостояние; исходник не подтверждает, что поставка вызвала отставание монтажа.

## Программы и проекты аналитика (S0)

> **certainty:** assumption
>
> Read-model внутри `PRJ-01`. Норматив: [ADR-0006](../06-architecture/decisions/0006-portfolio-program-project-read-model.md) и change `portfolio-program-project`. Код фикстур — после review.

Отображаемое имя единственного портфеля — «Строительство фармацевтической фабрики (Greenfield)». В файле аналитика «Демо-данные для Фармы.md» эта строка — заголовок программы; в согласованной иерархии демо это имя портфеля. Поле `PROJECT.name` хранит его. Внутренний id остаётся `PRJ-01`. Короткая подпись «Портфель 01» — отдельная строка навигации, не это имя. Семь имён программ и имена проектов аналитика не берутся из этого заголовка.

Семь программ: `PRG-DSN` AN-01…05, `PRG-CON` AN-06…08, `PRG-ENG` AN-09…12 и AN-24, `PRG-EQP` AN-13…14, `PRG-DIG` AN-15…18, `PRG-STA` AN-19…21 и AN-25, `PRG-ORG` AN-22…23.

Подробный сюжет у пяти проектов. `AN-08`, `AN-09`, `AN-24` наследуют снимки вех и HVAC: Green на A–B, Red на C–S. `AN-06` и `AN-07` имеют синтетические владельца и ход и статус Yellow на всех снимках, потому что в исходнике есть ⚠️ и ❌, а их вехи обзора остаются Green.

Остальные двадцать строк тонкие. Из исходника берутся имя, номер и программа. `sourceAttention = lag`, если в блоке есть ⚠️ или ❌ (`AN-01`…`AN-05`, `AN-10`…`AN-14`, `AN-16`…`AN-19`, `AN-22`); иначе `none` (`AN-15`, `AN-20`, `AN-21`, `AN-23`, `AN-25`). Владелец тонкой строки — «не назначен», даты и ход — «нет в этом показе». Статус Yellow при `lag` и Green при `none` на каждом снимке A–S. Недели отставания для тонких строк не выдумываются.

Статус программы — худший статус её проектов. Пустой набор вех программу не делает зелёной: `PRG-DSN` Yellow и без вех. Фильтр «Требует внимания» оставляет Yellow и Red.

У вехи один ID. `portfolioVisible` и `programId` независимы. `MS-CLN-PANEL` видна в 12 и в `PRG-CON`. `MS-UTL-PWR` видна в 12 и в `PRG-ENG`. `MS-PS` только в портфельной шкале. `PRG-DSN` не получает вех.

## Подвыборка календарного плана (R1/R2)

> **certainty:** assumption
>
> Демоданные. В файле аналитика нет дат, процентов и типов стрелок SS/SF/FF/FS. Числа ниже синтетические и существуют только для показа. Норматив строк: change (`openspec/changes/archive/2026-11-07-schedule-hierarchy-baseline-forecast/design.md`).

На снимке C к прежним `WK-01`…`WK-05` добавляется дерево проекта `AN-08` «Внутренняя отделка и чистые помещения» и этапа `8.2` «Чистые помещения классов C/D». У этапа в исходнике отметка `⚠️3н`; в данных это `sourceWeeks: 3`, не процент. Процент группы неизвестен.

`8.2.1` «Сэндвич-панели и герметизация»: прогноз `2027-02-25`…`2027-03-02`, ход 0, базы нет, статус Delayed, те же 3 недели на своей строке. `8.2.2` «Фальшполы и потолки»: прогноз `2027-03-04`…`2027-03-18`, ход 40, база `2027-02-26`…`2027-03-08`, статус OnSchedule. Ход 0 и неизвестный ход — разные значения. У `WK-01` ход явно 100; статус Completed сам по себе процент не задаёт. У `WK-02`…`WK-05` ход неизвестен.

`MS-CLN-PANEL` остаётся одной вехой с прежним id и прежними датами. На C она вложена в этап `8.2` с кодом структуры `8.2.3`. Второй строки с этим id нет. Кластер WK не становится детьми `8.2`: имена работ не совпадают, а четыре стрелки остаются на WK. На A, D и F новых групп и работ `8.2.*` нет; веха снова без родителя в календаре.

## Подвыборка AN-24 → AN-09 (снимок C)

> **certainty:** assumption
>
> Согласовано 2026-11-06 как следующая подвыборка, не как факт графика. В исходнике нет календарных дат и процентов. Прогнозы ниже синтетические и существуют только для показа. Норматив: change (`openspec/changes/archive/2026-11-07-schedule-c-cross-project-subsample/proposal.md`).

**Обновление 2026-11-08:** календарный план импортирует полный файл аналитика (25 проектов / 564 строки WBS). Имя Greenfield в исходнике — provenance для портфеля `PRJ-01`; UI сохраняет **7 программ** `PRG-*` и **25** `AN-*`. По умолчанию при входе и смене снимка раскрыты **все** группы payload (не curated `AN-08`/`8.2`). Даты/проценты по-прежнему DEMO_ASSUMPTION (якорь C для source status). См. `docs/07-delivery/reports/2026-11-08-analyst-import-audit.md`.

На снимке C `AN-24` содержит этап `24.1` (`sourceWeeks` 8 из ⚠️8н), `AN-09` — этап `9.3`.

Имена, родители и статусы взяты из строк аналитика. Статус работы выведен из отметки строки: ⚠️8н → Delayed, 🔄 → OnSchedule, ⏳ → Waiting. Процент в исходнике отсутствует, поэтому у новых групп и работ `progressPct` пустой (`null`), не ноль. Базового интервала у новых работ нет.

| Строка | Что из исходника | Что синтетическое |
|--------|------------------|-------------------|
| `24.1.1` «Два ввода от сети» | имя, ⚠️8н | прогноз `2027-02-08`…`2027-03-19` |
| `24.1.2` «Подстанция» | имя, 🔄 | прогноз `2027-02-15`…`2027-03-12` |
| `9.3.1` «Установка AHU» | имя, 🔄 | прогноз `2027-02-22`…`2027-03-19` |
| `9.3.2` «Подключение к сетям» | имя, ⏳, предшественник `24.1.3` | прогноз `2027-04-16`…`2027-04-30` |

`MS-UTL-PWR` остаётся одной вехой каталога: baseline `2027-02-18`, на C прогноз `2027-04-15`. На C она вложена в `24.1` с кодом `24.1.3`. Второй строки нет. На A, D и F она снова без родителя в календаре, и новых групп там нет.

Четыре стрелки WK и база `8.2.2` не меняются. Review 2026-11-06 принял линию `LNK-X-PWR-HVAC`: `MS-UTL-PWR` → `9.3.2`, вид `cross_project_predecessor`, без типа FS/SS/FF/SF. У `9.3.2` факта нет.
