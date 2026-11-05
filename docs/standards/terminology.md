---
id: DOC-STD-002
title: Глоссарий терминов
type: standard
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-10-30'
owner: docs-engineering
related:
  - DOC-STD-001
---
# Глоссарий терминов

Краткие определения. Не утверждает доменные pharma/GMP требования — только язык проекта.

| Термин | Определение |
|--------|-------------|
| **Pharma Demo** | Рабочее имя продукта/проекта (контекст уточняется в discovery/product). |
| **OpenSpec** | Подход/инструментарий спецификаций изменений рядом с кодом. |
| **ADR** | Architecture Decision Record — запись архитектурного решения (формат MADR). |
| **MADR** | Markdown Architectural Decision Records (bare-шаблон). |
| **arc42** | Шаблон описания архитектуры; в проекте используется subset секций. |
| **Docusaurus** | Целевой генератор сайта документации (направление). |
| **certainty** | Степень уверенности утверждения в теле документа: fact / assumption / hypothesis / open_question. |
| **status** | Жизненный цикл документа в frontmatter: draft / review / approved / deprecated / archived. |
| **Demo v1** | Демонстрационный контур FE+BE без PostgreSQL; mock только в NestJS. |
| **Persistence adapter** | Абстракция хранения; mock-реализация сменяется на PostgreSQL. |
| **REQ-AREA-NNN** | Схема ID требований (AREA — доменная область). |
| **Handoff** | Передача контекста между волнами/агентами/людьми. |
| **Quality gate** | Проверка, без прохождения которой нельзя считать этап завершённым. |
| **Diátaxis** | Система организации гайдов: tutorials / how-to / explanation / reference. |
| **ppc-net** | Имя Docker Compose network для локального контура (см. ADR-0003). |
