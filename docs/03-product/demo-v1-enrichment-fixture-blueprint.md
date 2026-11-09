---
id: DOC-PROD-021
title: Demo v1 enrichment — точный blueprint фикстур
type: product
status: draft
version: 0.3.0
created: '2026-11-01'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-012
  - DOC-PROD-019
  - DOC-PROD-020
  - DOC-PROD-022
  - DOC-BA-014
  - DOC-BA-015
---
# Demo v1 enrichment — exact fixture blueprint

> **certainty:** hypothesis
>
> Exact inventory after **R1**. Demo assumptions ≠ реальное предприятие / полная GMP-модель.
>
> **Calendar:** DOC-PROD-012 — **2027**; PS baseline **2027-09-15**.  
> **Spine:** `PRT-01` (historical draft id `PRJ-01`), `EQ-HVAC-01`, `MS-PS`, `ISS-001`, `RISK-001`, `DEC-001`.

**Counts:** Equipment **23** · Milestones 14 · Issues 11 · Risks 12 · Decisions 6 · Owner roles (metadata) 5 · Snapshots 01–08.

---

## 1. Owner roles (fixture metadata — not Owner entity)

| ID | RU name | Typical use |
|----|---------|-------------|
| SH-DIR-01 | Директор проекта | Decision ownerRole |
| SH-PM-01 | Руководитель проекта | Issue ownerRole |
| SH-ENG-01 | Главный инженер | Engineering decisions / issues |
| SH-QC-01 | Руководитель QC | QC |
| SH-PKG-01 | Руководитель упаковки | Packaging |

Store as `ownerRole` / `owner` **strings** on Issue/Decision. No Owner API entity.

---

## 2. Equipment (23)

| ID | RU title | WS | Critical | Baseline delivery | Notes |
|----|----------|----|----------|-------------------|-------|
| EQ-BLD-02 | Комплект технических дверей и шлюзов оболочки | WS-BLD | false | 2027-02-01 | **REPLACE** (was кровля); ISS-BLD-01 |
| EQ-CLN-01 | Панели чистых помещений | WS-CLN | true | 2027-03-15 | S2 |
| EQ-CLN-02 | Шлюзы и передаточные окна | WS-CLN | false | 2027-03-20 | |
| EQ-CLN-03 | Комплект мебели и оснащения чистых зон | WS-CLN | false | 2027-04-01 | **RENAME** |
| **EQ-HVAC-01** | **Приточная установка AHU (long-lead)** | WS-HVAC | **true** | **2027-05-15** | **Sole PS driver** |
| EQ-HVAC-02 | Вторичная AHU / рециркуляция | WS-HVAC | true | 2027-05-20 | |
| EQ-HVAC-03 | Шкафы автоматики HVAC | WS-HVAC | false | 2027-06-01 | |
| EQ-UTL-01 | Установка получения PW | WS-UTL | true | 2027-05-10 | |
| EQ-UTL-02 | Дистиллятор WFI | WS-UTL | true | 2027-05-20 | S3 |
| EQ-UTL-03 | Генератор чистого пара | WS-UTL | true | 2027-05-25 | |
| EQ-UTL-04 | ИБП / резервное питание | WS-UTL | true | 2027-04-01 | |
| EQ-UTL-05 | Компримированный воздух / газы | WS-UTL | false | 2027-05-05 | |
| EQ-PRD-01 | Реакторный блок / процессные ёмкости | WS-PRD | true | 2027-06-01 | |
| EQ-PRD-02 | Станция CIP/SIP | WS-PRD | true | 2027-06-10 | |
| EQ-PRD-03 | Система буферной подготовки | WS-PRD | false | 2027-06-15 | |
| EQ-PKG-01 | Линия первичной упаковки | WS-PKG | true | 2027-06-20 | S4 |
| EQ-PKG-02 | Картонажная линия | WS-PKG | false | 2027-07-01 | |
| EQ-PKG-03 | Сериализация / агрегация | WS-PKG | true | 2027-07-05 | |
| EQ-QC-01 | ВЭЖХ (HPLC) | WS-QC | true | 2027-05-15 | S5 |
| EQ-QC-02 | Климатические камеры стабильности | WS-QC | false | 2027-05-20 | |
| EQ-QC-03 | Инкубаторы микробиологии | WS-QC | true | 2027-05-25 | |
| EQ-AUT-01 | Центральный BMS | WS-AUT | true | 2027-06-01 | |
| EQ-AUT-02 | Система мониторинга EMS | WS-AUT | true | 2027-06-10 | |

**MOVE OUT (not Equipment):** former EQ-BLD-01 «Каркас и ограждающие конструкции» — building readiness via **MS-BLD-ENCL** only.

UI always shows RU `name`.

---

## 3. Milestones (14)

| ID | RU title | WS | Baseline | Typical Risk | Typical Decision |
|----|----------|----|----------|--------------|------------------|
| MS-BLD-ENCL | Оболочка здания закрыта | WS-BLD | 2027-02-28 | RISK-BLD-01 | — |
| MS-CLN-RDY | Чистые помещения готовы к HVAC | WS-CLN | 2027-04-30 | RISK-CLN-01 | DEC-CLN-01 |
| MS-HVAC-IQ | Демо-гейт готовности HVAC (IQ) | WS-HVAC | 2027-06-15 | RISK-HVAC-02 | — |
| MS-UTL-PW | PW доступна для использования | WS-UTL | 2027-06-20 | — | — |
| MS-UTL-WFI | WFI доступна для использования | WS-UTL | 2027-07-01 | RISK-UTL-01 | DEC-UTL-01 |
| MS-PRD-INST | Технологическое оборудование смонтировано | WS-PRD | 2027-07-15 | RISK-PRD-01 | — |
| MS-PKG-FAT | FAT упаковочной линии принят | WS-PKG | 2027-07-20 | — | — |
| MS-PKG-SAT | SAT упаковочной линии принят | WS-PKG | 2027-08-10 | RISK-PKG-01 | DEC-PKG-01 |
| MS-QC-RDY | QC-лаборатория готова к работе | WS-QC | 2027-07-10 | RISK-QC-01 | DEC-QC-01 |
| MS-AUT-BMS | BMS введён в эксплуатацию | WS-AUT | 2027-07-25 | RISK-AUT-01 | DEC-AUT-01 |
| MS-COM-IQ | Общий демо-гейт готовности (IQ) | WS-AUT | 2027-08-05 | RISK-COM-01 | — |
| MS-COM-OQ | Общий демо-гейт готовности (OQ) | WS-AUT | 2027-08-15 | — | — |
| MS-COM-PQ | Общий демо-гейт готовности (PQ) | WS-AUT | 2027-08-25 | — | — |
| **MS-PS** | **Готовность к старту производства** | — | **2027-09-15** | **RISK-001** | **DEC-001** |

PS forecast driver: **EQ-HVAC-01 / RISK-001** only (BR-004).

---

## 4. Issues (11)

Statuses Must: **Open | Mitigating | Closed**. Effects fixture-authored.

| ID | RU title | WS | EQ | Milestone | Risk | Lifecycle |
|----|----------|----|----|-----------|------|-----------|
| **ISS-001** | **Прогноз сдвига поставки long-lead AHU** | WS-HVAC | EQ-HVAC-01 | MS-PS | RISK-001 | Open@C → Mitigating@F→H |
| ISS-HVAC-02 | Неполный комплект документации поставки AHU | WS-HVAC | EQ-HVAC-01 | MS-HVAC-IQ | RISK-HVAC-02 | Open@D |
| ISS-CLN-01 | Отставание монтажа панелей чистых зон | WS-CLN | EQ-CLN-01 | MS-CLN-RDY | RISK-CLN-01 | Open@D → Mitigating@F |
| ISS-UTL-01 | Прогноз сдвига поставки дистиллятора WFI | WS-UTL | EQ-UTL-02 | MS-UTL-WFI | RISK-UTL-01 | Open@E → Mitigating@F |
| ISS-UTL-02 | Дефицит мощности ИБП на критических нагрузках | WS-UTL | EQ-UTL-04 | — | RISK-UTL-02 | Open@E |
| ISS-PRD-01 | Несогласованность интерфейсов CIP с реакторным блоком | WS-PRD | EQ-PRD-02 | MS-PRD-INST | RISK-PRD-01 | Open@E |
| ISS-PKG-01 | Прогноз срыва срока FAT первичной упаковки | WS-PKG | EQ-PKG-01 | MS-PKG-SAT | RISK-PKG-01 | Open@B → Mitigating@F → **Closed@G** |
| ISS-PKG-02 | Отставание сериализации от графика интеграции | WS-PKG | EQ-PKG-03 | MS-PKG-SAT | RISK-PKG-02 | Open@E |
| ISS-QC-01 | Прогноз поздней поставки HPLC | WS-QC | EQ-QC-01 | MS-QC-RDY | RISK-QC-01 | Open@E → Mitigating@G |
| ISS-AUT-01 | Конфликт точек интеграции BMS / EMS | WS-AUT | EQ-AUT-01 | MS-AUT-BMS | RISK-AUT-01 | Open@E |
| ISS-BLD-01 | Замечания по комплектности технических дверей оболочки | WS-BLD | EQ-BLD-02 | MS-BLD-ENCL | RISK-BLD-01 | Open@B → **Closed@C** |

Closed ≠ auto Green Risk / MS / forecast. When Closed, BR-002 Red expectation for that Issue stops (PKG Risk may be Green in 07 via fixture).

---

## 5. Risks (12)

| ID | RU title | WS | EQ | MS | Issue |
|----|----------|----|----|----|-------|
| **RISK-001** | **Срыв окна монтажа HVAC → сдвиг старта производства** | WS-HVAC | EQ-HVAC-01 | MS-PS | ISS-001 |
| RISK-HVAC-02 | Доп. задержка демо-гейта HVAC (IQ) из-за документации | WS-HVAC | EQ-HVAC-01 | MS-HVAC-IQ | ISS-HVAC-02 |
| RISK-CLN-01 | Неготовность чистых зон к пуску HVAC | WS-CLN | EQ-CLN-01 | MS-CLN-RDY | ISS-CLN-01 |
| RISK-UTL-01 | Недоступность WFI к технологическим прогонам | WS-UTL | EQ-UTL-02 | MS-UTL-WFI | ISS-UTL-01 |
| RISK-UTL-02 | Риск простоя критических нагрузок без ИБП | WS-UTL | EQ-UTL-04 | — | ISS-UTL-02 |
| RISK-PRD-01 | Сдвиг монтажа процессного оборудования | WS-PRD | EQ-PRD-01 | MS-PRD-INST | ISS-PRD-01 |
| RISK-PKG-01 | Срыв SAT упаковки | WS-PKG | EQ-PKG-01 | MS-PKG-SAT | ISS-PKG-01 |
| RISK-PKG-02 | Неготовность сериализации к релизу | WS-PKG | EQ-PKG-03 | MS-PKG-SAT | ISS-PKG-02 |
| RISK-QC-01 | Задержка готовности QC к поддержке запуска | WS-QC | EQ-QC-01 | MS-QC-RDY | ISS-QC-01 |
| RISK-AUT-01 | Неготовность BMS к мониторингу зон | WS-AUT | EQ-AUT-01 | MS-AUT-BMS | ISS-AUT-01 |
| RISK-BLD-01 | Локальный риск по готовности оболочки здания | WS-BLD | EQ-BLD-02 | MS-BLD-ENCL | ISS-BLD-01 |
| RISK-COM-01 | Накопительный риск срыва общего демо-гейта (IQ) | WS-AUT | — | MS-COM-IQ | — |

Domain rag: Green\|Red. Yellow UX = attention without Red Risk.

---

## 6. Decisions (6) — Project + optional Milestone only

| ID | RU title | Type | First | projectId | milestoneId | ownerRole | dueDate | Rationale | Fixture effect note |
|----|----------|------|-------|-----------|-------------|-----------|---------|-----------|---------------------|
| DEC-001 | Утвердить ускоренную логистику AHU и резервный монтажный слот | PrioritizeRecovery | 06 | PRT-01 | MS-PS | SH-DIR-01 | 2027-05-15 | Восстановить окно монтажа HVAC | **Не** меняет Δ; F остаётся +21 |
| DEC-UTL-01 | Согласовать параллельный ввод PW и сжатый монтаж WFI | PrioritizeRecovery | 06 | PRT-01 | MS-UTL-WFI | SH-ENG-01 | 2027-05-20 | Сократить простой utilities | Partial; residual WFI остаётся |
| DEC-CLN-01 | Усилить бригаду монтажа чистых зон (две смены) | PrioritizeRecovery | 06 | PRT-01 | MS-CLN-RDY | SH-ENG-01 | 2027-04-30 | Ускорить готовность к HVAC | Intent; residual CLN |
| DEC-PKG-01 | Зафиксировать принятие текущего прогноза SAT с оговорками по сериализации | AcceptDateSlip | 07 | PRT-01 | MS-PKG-SAT | SH-PKG-01 | — | Принять управленчески текущий горизонт упаковки | Packaging recovery в 07 **fixture-authored**, не эффект DEC |
| DEC-QC-01 | Временно использовать контрактную лабораторию для HPLC | PrioritizeRecovery | 07 | PRT-01 | MS-QC-RDY | SH-QC-01 | 2027-06-01 | Снять блокер QC | Intent; EQ may stay Delayed |
| DEC-AUT-01 | Зафиксировать freeze точек интеграции BMS/EMS | PrioritizeRecovery | 08 | PRT-01 | MS-AUT-BMS | SH-ENG-01 | 2027-06-15 | Стабилизировать интеграцию | Governance; attention may remain |

**Forbidden:** Decision→Equipment / Issue / Risk.  
Management intent language only — not backend commands.

---

## 7. Equipment Δ by snapshot (days vs baseline)

| EQ | A | B | C | D | E | F | G | H |
|----|---|---|---|---|---|---|---|---|
| EQ-HVAC-01 | 0 | 0 | **+21** | +21 | +21 | +21 | **+14** | +14 |
| EQ-HVAC-02 | 0 | 0 | 0 | +7 | +7 | +7 | +7 | +7 |
| EQ-CLN-01 | 0 | 0 | 0 | **+14** | +14 | +10 | +7 | +7 |
| EQ-UTL-02 | 0 | 0 | 0 | 0 | **+18** | +18 | +12 | +12 |
| EQ-UTL-04 | 0 | 0 | 0 | 0 | +10 | +10 | +10 | +7 |
| EQ-PKG-01 | 0 | **+10** | +10 | +10 | +14 | +7 | **0** | 0 |
| EQ-PKG-03 | 0 | 0 | 0 | 0 | +10 | +10 | +7 | +7 |
| EQ-QC-01 | 0 | 0 | 0 | 0 | +14 | +14 | +7 | +7 |
| EQ-PRD-02 | 0 | 0 | 0 | 0 | +7 | +7 | +7 | +7 |
| EQ-AUT-01 | 0 | 0 | 0 | 0 | +7 | +7 | +7 | +5 |
| EQ-BLD-02 | 0 | +5 | 0 | 0 | 0 | 0 | 0 | 0 |
| others | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

PS: 01–02 = 2027-09-15; 03–06 = **2027-10-06** (+21); 07–08 = **2027-09-29** (+14).  
07/08 Δ improvement = **fixture-authored progress**, not automatic DEC-001 effect.

---

## 8. Relationship matrix (direct only)

| Edge | Allowed |
|------|---------|
| Project → EQ/MS/ISS/RISK/DEC | yes |
| Equipment → Issue / Risk | yes |
| Issue → Risk | yes |
| Issue → Milestone | **YES** |
| Risk → Milestone / Equipment / Issue | yes |
| Decision → Project | **YES** |
| Decision → Milestone | **YES** optional |
| Decision → EQ / Issue / Risk | **NO** |
| Equipment → Milestone | **NO** |
| Decision → auto reforecast | **NO** |

---

## 9. Data integrity rules

1. Stable IDs across 01–08.  
2. RU titles required.  
3. No orphan Red Risk without Issue (except RISK-COM-01 narrative).  
4. Delayed ⇒ forecast ≥ baseline.  
5. **BR-007:** RISK-001 Red ⇒ MS-PS not Green (any snap).  
6. Decision requires `projectId`; prefer `milestoneId`.  
7. Closed Issue + residual unrelated Δ must be narratively separate (HVAC vs PKG).  
8. Self-contained snapshot fixtures.  
9. Live Presentation punch on **C** (HVAC +21 / RISK-001 Red).  
10. No Domain `managementPriority` / `Issue.critical`.

---

## 10. Mapping current Demo → enriched

| Current | Enriched |
|---------|----------|
| Snapshot 01 | 01 |
| Snapshot 02 (HVAC +21) | **03** |
| Snapshot 03 (DEC-001) | **F** |
| Spine IDs | unchanged |
