---
id: DOC-DISC-010
title: Реестры Discovery
type: discovery
status: draft
version: 0.6.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-DISC-011
  - DOC-DISC-013
  - DOC-DISC-014
  - DOC-DISC-015
  - DOC-DISC-016
  - DOC-DISC-018
  - DOC-DISC-021
  - DOC-PHASE-DISC-001
---
# Discovery registers

Единый реестр проблем, гипотез, открытых вопросов и доказательств. Certainty: source-`fact` ≠ применимость к предприятию.

## Problems

| ID | Проблема / боль | Связанные роли/процессы | Certainty | Примечание |
|----|-----------------|-------------------------|-----------|------------|
| P-001 | Нет единого управленческого контура статуса проекта для директора и stakeholders | director, PM; status reporting; PROC-001, PROC-004, PROC-005, PROC-007…011 (см. DOC-DISC-016) | hypothesis | DOC-DISC-012; process-inventory |
| P-002 | Решения по отклонениям опираются на разрозненные отчёты и устные статусы | director, PM, functional leads; PROC-001, PROC-003…005, PROC-011 | hypothesis | DOC-DISC-012; process-inventory |
| P-003 | Сложно убедительно показать ценность project control / low-code без живого demo narrative | product owner; demo; PROC-011 (narrative) | hypothesis | DOC-DISC-012; primary narrative выбран PO (SCN-001→SCN-007) — боль как hypothesis сохраняется |
| P-004 | Неясен framing демо: platform showcase vs standalone MVP | product owner | open_question | HIP-007 |

## Hypotheses

| ID | Гипотеза | Проверка | Статус |
|----|----------|----------|--------|
| H-001 | Демо для директора + project stakeholders как showcase low-code/platform — ближайший фокус Discovery | HIP-007 (framing platform vs MVP ещё open) | open |
| H-002 | Ценность для директора — сжатый / целостный обзор готовности к вехам и угрозам дате запуска | HIP-001, HIP-008 | po_selected_leading — ведущая для демо; content остаётся hypothesis (не enterprise-fact) |
| H-003 | Ценность для PM — единый контур статуса активностей, вех, рисков, issues | HIP-001, HIP-008 | po_selected_supporting — supporting для демо; content остаётся hypothesis |
| H-004 | Ценность для functional leads — связь deliverables с вехами проекта | HIP-008 (не выбрана как ведущая) | open |
| HYP-001 | Типовой pharma facility-проект удобно описывать стадиями design → construction → equipment → CQV → production readiness (с перекрытиями). | Expert / customer review domain-overview | open |
| HYP-002 | Критический путь даты запуска часто проходит через пересечение construction, long-lead equipment (FAT/SAT) и CQV/documentation (TOP), а не только «чистое» строительство. | Expert interview; process-inventory (D2) | open |
| HYP-003 | Для директора / PM ценность project controls — ранняя видимость сдвига milestone «ready for production» из-за CQV/TOP/equipment, а не детальный Gantt ради отчёта. | Product-context + HIP audience; D3 scenarios | open |
| HYP-004 | «Inspection readiness» на этапе facility-проекта = прослеживаемость design→as-built→commissioning→qualification + закрытые punch/deviations, а не полный Site Master File коммерческого сайта. | Expert; OQ-003 messaging | open |
| HYP-005 | Зонтичный термин **CQV** понятен аудитории демо; альтернатива — **C&Q** (ISPE) без явного Validation в UI. | Product owner / expert | open |
| HYP-006 | Кандидатный набор ролей SH-001…SH-011 в DOC-DISC-015 достаточен для первого demo narrative (director + PM + selected functional leads); остальные роли — опциональны до expert confirm. | HIP-005, HIP-009 | open |
| HYP-007 | Кандидатный набор процессов PROC-001…PROC-011 (schedule, budget, change, risk, issue, contractors, equipment/supply, documentation/handover, readiness, milestones/gates, management reporting) достаточен как инвентарь Discovery для сценариев project controls без претензии на полноту SOP заказчика. | Expert / customer (HIP-005); review DOC-DISC-016 | open |
| HYP-008 | Ядро управленческого контура для P-001 / H-002…H-003 — schedule + milestones/gates + readiness + equipment/supply + documentation/handover + risk/issue/change + management reporting; budget и contractors — опциональны до подтверждения заказчиком. | HIP-005; OQ-012, OQ-013; D3/D4 prioritization | open |
| HYP-009 | Каталог SCN-001…SCN-008 (DOC-DISC-018) достаточен как набор кандидатных demo narratives Discovery. | HIP-006 answered (primary выбран); expert/customer spot-check применимости — open | open |
| HYP-010 | Primary director-led narrative: SCN-001 → SCN-007 (PO); SCN-006 — необязательная доп. сцена без расширения Demo v1; SCN-003 / first-class PROC-006 условны до OQ-012 / OQ-013. | HIP-006, HIP-008 answered; OQ-015 closed | po_selected — выбор демо; не = enterprise process confirmation |

Статусы гипотез: `open` | `po_selected` / `po_selected_leading` / `po_selected_supporting` (направление демо от PO). Выбор PO **не** повышает применимость к предприятию до `fact`.

## Open Questions

| ID | Вопрос | Адресат | Блокирует | Статус |
|----|--------|---------|-----------|--------|
| OQ-001 | Кто primary audience демо: директор / PM / оба? | product owner | D5 done | closed — HIP-001: primary директор; secondary PM / Project Controls |
| OQ-002 | Есть ли доступ к отраслевому эксперту в горизонте фазы? | product owner | applicability facts | open |
| OQ-003 | Упоминать GMP/CSV в демо как контекст или избегать? | product owner | messaging | open |
| OQ-004 | Горизонт демо: один завод / один проект / multi-project? | product owner | scope candidates | open |
| OQ-005 | Какие процессы/роли критичны у заказчика? | expert/customer | enterprise-fact | open |
| OQ-006 | Какой набор milestone обязателен у целевого заказчика (MC, FAT/SAT, IQ/OQ/PQ, TOP accepted, ready for production…)? | expert/customer | domain applicability | open |
| OQ-007 | Использовать в продукте/демо термин CQV или C&Q? | product owner / expert | glossary / UI language | open |
| OQ-008 | Нужен ли в Demo v1 явный статус inspection-ready документов или достаточно readiness/milestone? | product owner | D4 candidates | open |
| OQ-009 | Нужен ли в UI термин TOP / turnover package или нейтральный «handover package»? | product owner / expert | glossary / UI language | open |
| OQ-010 | Является ли Project Controls Manager (SH-003) отдельной ролью от PM (SH-002) у целевого заказчика или совмещена? | expert/customer | stakeholder RACI / demo personas | open |
| OQ-011 | Какие candidate-роли из DOC-DISC-015 вне director/PM/именованных functional leads (SH-008…SH-011, также Quality SH-009) входят в боль P-001/P-002 и в demo cast? | product owner + expert/customer | role↔problem gaps; D3 scenarios | open |
| OQ-012 | Входит ли budget / cost control (PROC-002) в первичный demo narrative и боли P-001…P-003, или остаётся в соседнем ERP/finance контуре? | product owner / expert | D3 scenarios; D4 MoSCoW | open — primary без cost (SCN-001→007); вопрос для BA scope |
| OQ-013 | Нужен ли contractors (PROC-006) как first-class процесс в Demo v1 / narrative, или достаточно contractor как атрибута activities/issues? | product owner / expert | D3/D4 scope | open — не в primary SCN-001→007 |
| OQ-014 | Где в messaging демо граница «project change» (PROC-003) vs site PQS/GMP change control — показывать явно, нейтрально или избегать? | product owner (+ expert) | messaging; связано с OQ-003 / HIP-003 | open |
| OQ-015 | Какой сценарий (или связка) из SCN-001…SCN-008 (DOC-DISC-018) выбрать как primary demo narrative для D5? | product owner | HIP-006; D5 done vs paused | closed — HIP-006: SCN-001→SCN-007; SCN-006 optional only |

## Evidence

Поля записи: **EV-ID** | название | организация | дата/версия | URL | дата обращения | подтверждаемое утверждение.

| EV-ID | Название | Организация | Дата/версия | URL | Дата обращения | Утверждение |
|-------|----------|-------------|-------------|-----|----------------|-------------|
| EV-001 | Baseline Guide Vol 5: Commissioning & Qualification 2nd Edition (product page) | ISPE | Published June 2019; Second Edition | https://ispe.org/publications/guidance-documents/baseline-guide-vol-5-commissioning-qualification-2nd-edition | 2026-10-30 | Guide provides practical guidance on science- and risk-based C&Q of pharmaceutical manufacturing facilities, systems, utilities, and equipment to demonstrate suitability for the intended purpose; covers QRM, URS, Design Review/DQ, acceptance and release, change management, GEP documentation. |
| EV-002 | ISPE Baseline Guide: C&Q 2nd Ed — QRM Addendum – C&Q Delivery Process (public PDF) | ISPE | Addendum to Baseline Guide Vol 5 C&Q 2nd Ed (June 2019 base) | https://ispewebassets.org/files/publications/guidance-documents/general-docs/ISPE-BGvol5-CQ2_Addendum.pdf | 2026-10-30 | Defines commissioning as planned, managed, documented approach to setting to work, start-up, regulation/adjustment, and installation/operation/performance verification to bring equipment/automation/systems to fully operational state meeting safety and end-user requirements; notes EU Annex 15 positions FAT/SAT within qualification. |
| EV-003 | PIC/S GMP revised Annex 15 — Qualification and Validation (text of Annex 15 stages) | PIC/S | Annex 15 as published with PE 009 series; document PS/INF 11/2015 PDF; current Guide listed as PE 009-18 Annexes on PIC/S Publications | https://picscheme.org/users_uploads/news_news_documents/ps_inf_11_2015_pics_gmp_revised_annex_15.pdf (see also https://picscheme.org/en/publications PE 009-18 Annexes) | 2026-10-30 | Qualification stages for equipment/facilities/utilities/systems include URS, DQ, FAT/SAT where applicable, IQ, OQ, PQ; FAT may be supplemented by SAT after receipt at manufacturing site. |
| EV-004 | WHO TRS 986 Annex 2: WHO good manufacturing practices for pharmaceutical products: main principles | WHO | TRS 986, Annex 2, 2014 | https://www.who.int/publications/m/item/trs986-annex2 ; PDF https://cdn.who.int/media/docs/default-source/medicines/norms-and-standards/trs986annex2.pdf | 2026-10-30 | Qualification and validation must document DQ, IQ, OQ, and process validation/PQ; VMP should define key elements; glossary defines validation; GMP §2 and inspection/authorization context for licensed manufacturers. |
| EV-005 | Good Practice Guide: Good Engineering Practice 2nd Edition (product page) | ISPE | Second Edition (page describes alignment with C&Q Baseline 2nd Ed) | https://ispe.org/index.php/publications/guidance-documents/good-practice-guide-good-engineering-practice-2nd-edition | 2026-10-30 | GEP covers complete lifecycle of engineering projects and engineered systems from conceptual design to retirement; positions GEP as enabler for QRM-based integrated C&Q. |
| EV-006 | Total Cost Management Framework TOC / overview (TCM2 sample PDF) | AACE International | TCM Framework 2nd Edition (TOC/sample) | https://web.aacei.org/docs/default-source/toc/toc_TCM2.pdf | 2026-10-30 | Project control is recursive PDCA cycle (planning, implementation, performance measurement, performance assessment) nested in strategic asset management; controls investment of resources in creating/modifying/maintaining/retiring an asset. |
| EV-007 | PMI Lexicon of Project Management Terms | Project Management Institute | Version 5.0 | https://www.pmi.org/-/media/pmi/documents/registered/pdf/pmbok-standards/pmi-lexicon-pm-terms.pdf?rev=447328d841c249af985d14177ddd5f95 | 2026-10-30 | Milestone = significant point or event in a portfolio, program, or project; milestone schedule presents milestones with planned dates; baseline/change control/project schedule definitions as in Lexicon. |
| EV-008 | A Practical Guide to Construction, Commissioning and Qualification Documentation – and its Critical Role in Achieving Compliance (*Pharmaceutical Engineering* reprint) | ISPE (Pharmaceutical Engineering); authors Wael Allan, Andrew D. Skibo | July/August 2005, Vol. 25 No. 4 (reprint PDF) | https://www.ispe.gr.jp/ISPE/07_public/pdf/pharmaceutical_03_en.pdf | 2026-10-30 | Turn Over Package (TOP) is organized documentation characterizing installed systems/equipment; pivotal for C&Q; can support/leverage IQ; may mark handover at mechanical completion or after commissioning/qualification depending on approach. |
| EV-009 | PIC/S GMP Guide Part I (Pharmaceutical Quality System opening) | PIC/S | PE 009 series Part I (docview); Guide PE 009-18 listed on Publications | https://picscheme.org/docview/11332 ; https://picscheme.org/en/publications | 2026-10-30 | Quality objective requires comprehensively designed and correctly implemented Pharmaceutical Quality System incorporating GMP and QRM; fully documented; effectiveness monitored; adequate competent personnel and suitable premises, equipment and facilities. |
| EV-010 | WHO TRS 986 Annex 2 — Introduction / inspection context | WHO | TRS 986, Annex 2, 2014 | https://www.who.int/publications/m/item/trs986-annex2 | 2026-10-30 | Licensed pharmaceutical products should be manufactured only by licensed manufacturers regularly inspected by competent national authorities; WHO GMP used as standard for manufacturing authorization assessment and as basis for inspection of manufacturing facilities. |
