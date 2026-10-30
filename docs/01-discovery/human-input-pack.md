---
id: DOC-DISC-011
title: "Human Input Pack (HIP)"
type: discovery
status: draft
version: "0.2.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-010
  - DOC-DISC-015
  - DOC-PHASE-DISC-001
---

# Human Input Pack (HIP)

Структурированные вопросы человеку. AI не заполняет ответы как `fact` применимости к предприятию.

## Правила адресатов

| Адресат | Решает |
|---------|--------|
| **product owner** | Demo narrative, audience, messaging, горизонт демо |
| **expert / customer** | Реальные процессы и роли предприятия |

Отсутствие эксперта **не** блокирует черновики D1–D3 и демо-гипотезы; блокирует только перевод применимости в `fact`.

## Вопросы

| ID | Вопрос | Адресат | Зачем | Блокирует | Статус | Ответ / ссылка | Certainty после ответа |
|----|--------|---------|-------|-----------|--------|----------------|------------------------|
| HIP-001 | Primary audience демо: директор предприятия / руководитель проекта / оба? | product owner | Фокус ценности и сценариев | D5 `done` (narrative) | open | | |
| HIP-002 | Есть ли доступ к отраслевому эксперту в горизонте фазы Discovery? | product owner | План validation | applicability → fact | open | | |
| HIP-003 | Упоминать GMP/CSV в демо как контекст или избегать регуляторной лексики? | product owner (+ expert при необходимости) | Messaging границ | demo messaging | open | | |
| HIP-004 | Горизонт демо: один завод / один проект / multi-project? | product owner | Scope candidates | D4 boundaries | open | | |
| HIP-005 | Какие процессы и роли реально критичны у заказчика? | expert/customer | Enterprise applicability | enterprise-fact | open | | |
| HIP-006 | Какой приоритетный демонстрационный narrative выбрать из каталога сценариев? Рекомендация Discovery: SCN-001→SCN-007 (см. DOC-DISC-020). | product owner | Закрытие Discovery | D5 `done` vs `paused` | open | | |
| HIP-007 | Primary framing демо: showcase low-code / platform или standalone product MVP project control? | product owner | Контекст ценности и messaging (DOC-DISC-012) | demo framing / P-004 | open | | |
| HIP-008 | Какая гипотеза ценности ведёт первый narrative: директор / PM / functional leads? | product owner | Приоритет сценариев D3–D5 | H-002…H-004; D5 narrative | open | | |
| HIP-009 | Подтвердить кандидатный набор ролей SH-001…SH-011 (DOC-DISC-015): какие роли реальны у заказчика и какие нужны как demo personas (минимум vs расширенный cast)? | expert/customer (+ product owner для demo cast) | Stakeholder applicability; OQ-010/OQ-011 | enterprise-fact + D3 personas | open | | |

## Статусы

- `open` — ответа нет
- `answered` — ответ зафиксирован в колонке «Ответ / ссылка»
- `deferred` — сознательно отложено (указать причину в ответе)
