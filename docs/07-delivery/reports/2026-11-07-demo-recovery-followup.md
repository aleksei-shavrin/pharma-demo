---
id: DOC-DEL-RECOVERY-FU
title: Demo recovery followup — строгая приёмка F/D, e2e, docs gates
type: delivery
status: draft
version: "0.1.1"
created: '2026-11-07'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-OPS-004
  - DOC-DEL-E02-PACK
---

# Demo recovery followup — 2026-11-07

> **certainty:** fact
>
> Cursor executor session `bf7ecd13-350e-4615-944b-758e679268a6` (Codex coordinator). Base HEAD `7f1441b`. Evidence: `/tmp/pharma-demo-artifacts/demo-recovery/`. Stack: `http://localhost:3080`. **E02 / C06 / C07** не закрывались.

## Итог

| Проверка | Результат |
|----------|-----------|
| `accept.mjs` → `acceptance.json` | **ok: true** — F и D на UI+DOM фактах |
| `e2e/demo-narrative.spec.ts` | **2 passed** (`E2E_BASE_URL=http://localhost:3080 E2E_SKIP_WEBSERVER=1`) |
| `check:frontmatter` / `check:ids` | **OK**; `DOC-OPS-004` уникален |
| Isolated `npm run docs:build` в `/tmp/pharma-demo-docs-build` | Сначала **FAIL** без env и с `to=/DOC-PORTAL-001`. После сверки: compose задаёт `DOCUSAURUS_BASE_URL=/docs/`; default конфига `/`. С env `/docs/` оставались реальные дефекты (footer/index → несуществующий slug; ссылки на unpublished `openspec/changes`). После правок — **OK** (exit 0). Не chown; `docs-portal-dev` сохранён |

## Приёмка F/D

- Снимок только через listbox: trigger `Снимок…` + `role=option` с полным `aria-label` (напр. `F — 20.04.2027 — Управленческие решения`).
- **F (все обязательны):** ровно 3 видимых `Решение записано`; `Соколов Андрей Викторович`; видимый `06.10.2027`; видимый `+21`. Без `\|\| hasF`.
- **D:** UI → D → «Отставание монтажа панелей…» (`focus=AN-08`) → `AN-08 · …` → `/projects/AN-08` → «Строительство» → «Дашборд»; буква снимка остаётся D. Без `page.goto` fallback на карточку.

Скрипт и JSON: `/tmp/pharma-demo-artifacts/demo-recovery/accept.mjs`, `acceptance.json`.

## Docs

- Frontmatter добавлен в [`repository-rename.md`](../../10-operations/repository-rename.md) (`DOC-OPS-004`).
- Registry обновлён штатным `npm run build:cross-ref`.
- Isolated build: rsync-копия без `.env` / `.docusaurus` / generated; symlink `node_modules`. Повтор с `DOCUSAURUS_BASE_URL=/docs/ DOCUSAURUS_URL=http://localhost:3080` + pipefail. Исправления: footer/index `to: '/'` (корневой `docs/README.md` = DOC-PORTAL-001); unpublished paths → code spans; каталоги assets → файл внутри. Log: `/tmp/pharma-demo-artifacts/calendar-header-recovery/docs-build-final.log`.

## E2E

Контракт A→C→D→F + default «Разделение» + missing entity; helper `selectSnapshot` на listbox. Issues/risks — listbox для B. **2 passed** в `cde4dfc` — не перегонялись без причины.

## Связанные треки

Calendar header recovery (паритет + Object one-line) — отдельный коммит; handoff [2026-11-07-calendar-header-recovery](../handoffs/2026-11-07-calendar-header-recovery.md). Push не выполнялся.
