---
id: DOC-ADR-README-001
title: Архитектурные решения (ADR)
type: index
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-TPL-ADR-001
sidebar_label: ADR
---
# Журнал ADR

Формат: MADR bare (см. [шаблон](../../_templates/adr.md)). Нумерация `NNNN-kebab-title.md`.

| ADR | Заголовок | Decision status |
|-----|-----------|-----------------|
| [0001](./0001-documentation-stack.md) | Documentation stack | accepted (направление) |
| [0002](./0002-target-technology-stack-direction.md) | Target technology stack direction | accepted (направление) |
| [0003](./0003-local-dev-urls-and-proxy.md) | Local dev URLs and proxy | accepted (направление) |
| [0004](./0004-d12-dhtmlx-gantt-community.md) | D12 Schedule timeline — dhtmlx-gantt Community | accepted (decision; doc lifecycle `draft`) |
| [0005](./0005-server-single-origin-compose.md) | Server single-origin Compose (`/backend`, `/docs`) | accepted (направление; doc lifecycle `draft`) |
| [0006](./0006-portfolio-program-project-read-model.md) | Портфель, программы и проекты как read-model | accepted (направление; doc lifecycle `draft`; review 2026-11-06) |
| [0007](./0007-demo-form-login.md) | Demo form login (Nest session + Next UI) | proposed (doc lifecycle `draft`; not human-approved) |

> **certainty:** assumption
>
> Decision status «accepted (направление)» означает согласие плана команды на направление; document `status` в frontmatter остаётся `draft`, пока человек не утвердит пакет docs.
