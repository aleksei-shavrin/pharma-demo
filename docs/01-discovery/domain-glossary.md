---
id: DOC-DISC-014
title: 'Глоссарий домена: фармацевтический объект / project controls'
type: discovery
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-DISC-010
  - DOC-DISC-013
  - DOC-STD-002
---
# Domain glossary: pharma facility / project controls

Рабочий глоссарий **доменных** терминов Discovery. Не смешивать с инженерным глоссарием репозитория: [`docs/standards/terminology.md`](../standards/terminology.md) (OpenSpec, ADR, Demo v1, certainty…).

Правило certainty: парафраз внешнего источника → `fact` + Evidence в [registers.md](./registers.md); применимость к предприятию / продукту → `assumption` / `hypothesis`.

Обзор lifecycle: [domain-overview.md](./domain-overview.md).

## Как читать таблицу

| Колонка | Смысл |
|---------|--------|
| Термин | EN tech term (как в отрасли) |
| Определение | Кратко, по-русски |
| Certainty | certainty блока определения |
| EV | Evidence ID или «—» |

---

## CQV / qualification / validation

| Термин | Определение | Certainty | EV |
|--------|-------------|-----------|-----|
| **CQV** | Рабочая аббревиатура Commissioning, Qualification, Validation — связка engineering start-up и documented verification пригодности systems/equipment/processes. В ISPE Baseline часто говорят **C&Q** (Commissioning and Qualification); «Validation» добавляют как соседний контур process/cleaning/CSV. | hypothesis (как зонтичный label) | EV-001, EV-002 |
| **C&Q** | Commissioning and Qualification: в ISPE Baseline Vol. 5 — science- and risk-based подход к C&Q pharmaceutical manufacturing facilities, systems, utilities и equipment для демонстрации suitability for the intended purpose. | fact (относительно ISPE) | EV-001 |
| **Commissioning** | Planned, managed and documented подход к setting to work, start-up, regulation/adjustment и verification, чтобы привести equipment/automation/systems в fully operational state per safety и end-user requirements; в QRM C&Q включает qualification testing и supporting documentation. | fact (относительно ISPE addendum) | EV-002 |
| **Qualification** | Documented verification, что facilities / utilities / equipment / systems соответствуют установленным требованиям и пригодны к intended purpose (стадии URS→DQ→…→PQ в Annex 15). | fact (относительно PIC/S Annex 15 / WHO) | EV-003, EV-004 |
| **Validation** | По WHO glossary в Annex 2: действие доказательства (per GMP), что procedure, process, equipment, material, activity или system действительно приводит к expected results (см. также qualification). | fact (относительно WHO) | EV-004 |
| **URS** | User Requirements Specification: спецификация requirements для equipment/facilities/utilities/systems; essential quality elements закладываются на этом этапе; URS — reference throughout validation life cycle (PIC/S Annex 15). | fact | EV-003 |
| **DQ** | Design Qualification: documented verification, что design соответствует GMP и что requirements URS verified during DQ. | fact | EV-003 |
| **IQ** | Installation Qualification: verification корректной установки components/instrumentation/equipment/pipework/services против drawings и specifications; сбор supplier instructions, calibration и т.п. | fact | EV-003 |
| **OQ** | Operational Qualification: тесты, что system operates as designed, включая operating limits / worst case; может комбинироваться с IQ (IOQ). | fact | EV-003 |
| **PQ** | Performance Qualification: обычно после IQ/OQ; verification performance using production material, qualified substitutes или simulated product; может сочетаться с OQ или process validation. | fact | EV-003 |
| **FAT** | Factory Acceptance Testing: оценка equipment у vendor до поставки (особенно novel/complex technology); подтверждение соответствия URS/functional specification на vendor site при применимости. | fact | EV-003 |
| **SAT** | Site Acceptance Testing: может дополнять FAT после получения equipment на manufacturing site; часть qualification stages в Annex 15. | fact | EV-003 |
| **GEP** | Good Engineering Practice: практики и процессы, поддерживающие design, delivery и operation engineered systems; scope — полный lifecycle от conceptual design до retirement (ISPE GEP Guide). | fact | EV-005 |
| **QRM** | Quality Risk Management: системный подход к оценке, контролю, коммуникации и review рисков для качества продукта (контекст ICH/ISPE C&Q; детали ICH не разворачиваем здесь). | hypothesis (краткое рабочее) | EV-001 |

## Handover / documentation

| Термин | Определение | Certainty | EV |
|--------|-------------|-----------|-----|
| **Turnover package / TOP** | Turn Over Package: организованный пакет документации (спецификации, manuals, drawings и др.), полностью характеризующий установленные systems/equipment; критичен для C&Q и может служить основой / leverage для IQ. | fact (относительно *Pharmaceutical Engineering* / ISPE) | EV-008 |
| **As-built** | Документация/чертежи, отражающие фактически установленную конфигурацию после строительства/монтажа (типичный элемент handover). | hypothesis | — |
| **Punch list** | Список незакрытых дефектов / незавершённых работ на handover; закрытие влияет на acceptance. | hypothesis | — |
| **Mechanical completion (MC)** | Контрольная точка: согласованный объём монтажа завершён; в отраслевой статье TOP может означать handover at mechanical completion **или** после commissioning/qualification — зависит от контракта. | hypothesis (+ контекст EV-008) | EV-008 |
| **Acceptance and release** | В ISPE C&Q — этап принятия системы как suitable for intended purpose (в связке с DQ / C&Q deliverables). | assumption (парафраз темы гайда; полный текст гайда платный) | EV-001 |
| **Inspection readiness** | Состояние документации и controls, при котором сайт / проект готов демонстрировать соответствие ожиданиям инспекции (PQS documented; premises/equipment suitable — контекст PIC/S/WHO). Для **строительного** проекта — обычно прослеживаемость design→install→CQV. | hypothesis | EV-009, EV-010 |
| **Validation Master Plan (VMP)** | Документ, в котором компания определяет key elements программы qualification and validation (WHO). | fact | EV-004 |

## Project controls / управление проектом

| Термин | Определение | Certainty | EV |
|--------|-------------|-----------|-----|
| **Project controls** | По AACE TCM: process контроля инвестирования ресурсов в актив на уровне проекта; PDCA: planning → implementation → performance measurement → performance assessment. | fact | EV-006 |
| **Milestone** | Significant point or event в portfolio, program или project (PMI Lexicon). | fact | EV-007 |
| **Milestone schedule** | Тип schedule, представляющий milestones с planned dates (PMI Lexicon). | fact | EV-007 |
| **Baseline (schedule/cost)** | Approved version work product / schedule / budget, изменяемая через formal change control и служащая основой сравнения с actual results (PMI Lexicon — baseline / schedule baseline / cost baseline). | fact | EV-007 |
| **WBS** | Work Breakdown Structure — декомпозиция scope проекта (употребляется в PMI/AACE project controls контексте). | assumption (рабочее; не цитируем полный PMBOK) | EV-006 |
| **Change control** | Process, whereby modifications to documents, deliverables или baselines identified, documented, approved или rejected (PMI Lexicon). | fact | EV-007 |
| **Schedule** | Output of a schedule model: linked activities with planned dates, durations, milestones и resources (PMI Lexicon — project schedule). | fact | EV-007 |
| **Earned value / EVA** | Техники измерения performance относительно baseline (часто в project controls); детали метода — вне scope этого глоссария. | hypothesis | — |

## Facility / production context (кратко)

| Термин | Определение | Certainty | EV |
|--------|-------------|-----------|-----|
| **Facility (pharma manufacturing)** | Производственный объект / комплекс premises, utilities и equipment для manufacture medicinal products (контекст GMP guides). | assumption | EV-001, EV-009 |
| **GMP** | Good Manufacturing Practice: часть quality management, обеспечивающая consistent production and control per quality standards и authorization (WHO Annex 2 §2). | fact | EV-004 |
| **PQS** | Pharmaceutical Quality System: comprehensively designed and correctly implemented система с GMP и QRM; documented; effectiveness monitored (PIC/S Part I). | fact | EV-009 |
| **Direct impact system** | В ISPE/C&Q практике — system с прямым влиянием на product quality / patient safety, требующий усиленного risk assessment и qualification focus (термин встречается в отраслевых материалах; точная классификация — site-specific). | hypothesis | EV-001, EV-008 |
| **Production start / readiness** | Готовность к началу (или возобновлению) регулируемого производства после facility/project activities: qualified systems, документация, people/process readiness. | hypothesis | — |
| **PPQ** | Process Performance Qualification — термин FDA/отрасли для стадии process validation; в ISPE addendum упоминается наряду с PQ. Не разворачиваем как FR. | hypothesis | EV-002 |

## Связанные, но не дублируемые здесь

| Тема | Где |
|------|-----|
| OpenSpec, ADR, Demo v1, certainty/status | [`terminology.md`](../standards/terminology.md) |
| Концепты данных продукта (Project, Milestone как entity…) | `information-concepts.md` (D3; не этот файл) |
| Роли заказчика | `stakeholders.md` (D2) |

## Открытые терминологические вопросы

> **certainty:** open_question
>
> Использовать в продукте/демо зонтик **CQV** или **C&Q** (ISPE), чтобы не смешивать с CSV / process validation?

> **certainty:** open_question
>
> Нужен ли в UI термин **TOP / turnover package**, или достаточно нейтрального «handover / document package»?
