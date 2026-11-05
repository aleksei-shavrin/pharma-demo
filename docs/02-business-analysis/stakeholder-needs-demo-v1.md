---
id: DOC-BA-012
title: Потребности заинтересованных сторон (Demo v1)
type: business
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-DISC-015
  - DOC-BA-011
  - DOC-DISC-011
sidebar_label: Потребности стейкхолдеров
---
# Потребности заинтересованных сторон (Demo v1)

Needs для ролей в narrative **SCN-001 → SCN-007**. Кандидаты SH-* из [stakeholders](../01-discovery/stakeholders.md) — не org chart заказчика.

> **certainty:** hypothesis
>
> Ниже — демо-needs; применимость к предприятию не `fact` (HIP-005/009 open).

## SH-001 — Enterprise director (primary audience)

| Need ID | Need | Обоснование |
|---------|------|-------------|
| N-DIR-01 | Видеть согласованный статус критического пути к дате production start без детального Gantt | H-002; SCN-007 |
| N-DIR-02 | Понимать, что именно сдвинуло прогноз (драйвер: equipment delay) | SCN-001→007 |
| N-DIR-03 | Иметь основу для решения: принять сдвиг даты / вехи или потребовать recovery | P-002; SCN-007 |

## SH-002 — Project manager (secondary / operational)

| Need ID | Need | Обоснование |
|---------|------|-------------|
| N-PM-01 | Зафиксировать отклонение equipment в едином контуре (не только в переписке) | H-003; SCN-001 |
| N-PM-02 | Связать equipment delay с risk/issue и milestone RAG | SCN-001 |
| N-PM-03 | Подготовить exception-сводку для директора | PROC-011; SCN-007 |
| N-PM-04 | После решения директора — иметь явный статус выбранного действия (recovery vs rebaseline) | SCN-007 |

## Supporting leads (SCN-001 cast)

| Role | Need | Certainty |
|------|------|-----------|
| SH-006 Procurement | Обновить прогноз поставки / FAT critical package | hypothesis |
| SH-007 Equipment installation | Обновить статус готовности к установке / SAT path | hypothesis |
| SH-003 Project Controls | Опционально; совмещение с PM — OQ-010 | open_question |

## Вне Demo v1 cast (explicit)

SH-008 Finance, SH-009 Quality, SH-010 Docs, SH-011 Contractor-as-persona, SH-004/005 как primary — **не** обязательны для SCN-001→007 Must (OQ-011; SCN-006 out).
