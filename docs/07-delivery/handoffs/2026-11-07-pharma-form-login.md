---
id: DOC-HANDOFF-2026-11-07-PHARMA-FORM-LOGIN
title: 'Handoff: pharma form login'
type: handoff
status: draft
version: '0.4.0'
created: '2026-11-07'
updated: '2026-11-07'
owner: docs-engineering
related:
  - DOC-ADR-0007
  - DOC-OPS-FORM-LOGIN-001
---

## Мета

- **От:** Cursor executor (session `dbf0df0f-368e-4c1a-a9ff-1a2af77dc22b`)
- **Кому:** Codex coordinator / human reviewer
- **Дата:** 2026-11-07
- **Область:** apps auth (Nest+Next), OpenSpec/ADR drafts, DX+server secrets, hardening, final login-error fix

## Цель волны

Demo form-login / logout; серверная защита; review hardening; финальное устранение Next «1 error» на anonymous `/login`.

## Сделано

- Form login UI + Nest session; hardening (allowlist, Caddy strip `X-Middleware-Subrequest`, no-store, server compose auth)
- **Final review:** live diagnose `localhost:3080/login` → console `401` on `/backend/v1/projects/PRJ-01/dashboard?snapshot=A` from `SnapshotProvider` bootstrap (pageErrors: none). TestFirst + skip bootstrap when `pathname` is `/login`.
- Coverage (scoped auth, earlier wave): API **91.84/81.13/100/91.66**; FE **95.72/84.09/100/95.72**
- Full unit suites (this wave): Web **373** pass / arch OK; API **239** pass + **1** pre-existing `architecture.boundary` fixture fail (dashboard/portfolio — **not** auth; not fixed)
- Docs gates: frontmatter/ids/certainty/portal-excludes **0**; markdownlint auth artifacts **0**
- Browser rewritten: clean login console/page/failed/unexpected HTTP; click login/logout + explicit API 401; DX `:3080` up
- Temp `*.headers` / cookie dumps deleted; `.dev-login-password` / `.env.dev-auth` kept
- Schedule concurrent dirty **preserved** (не чинили чужой architecture fail)

## Commands / exits (final)

| Check | Exit | Notes |
|-------|------|-------|
| `npm run web:test` | **0** | 75 files / **373** tests + FE architecture OK |
| `npm run api:test` | **1** | 239 pass; 1 fail `architecture.boundary` fixture imports (pre-existing, non-auth) |
| `npm run typecheck:web` | **0** | after SnapshotProvider skip |
| docs frontmatter/ids/certainty/portal | **0** | |
| markdownlint auth docs/plan/openspec | **0** | 6 files |
| Playwright `browser-acceptance.mjs` | **0** | `summary.json` ok + loginClean |

## Evidence paths

- Diagnose: `/tmp/pharma-form-login/diagnose-run.log` (pre: 401), `diagnose-after-fix.log` (clean)
- Browser: `/tmp/pharma-form-login/summary.json`, `desktop|mobile-0{1-5}-*.png`
- Units: `/tmp/pharma-form-login/api-full-unit.txt`, `web-full-unit.txt`
- Fix: `apps/web/src/lib/snapshot/snapshot-context.tsx` + `snapshot-context.login-skip.test.tsx`

## Не сделано / human-only

- Living OpenSpec apply/archive; ADR `approved`; commit/push/live
- Fixing API `architecture.boundary` fixture violations (чужой / pre-existing scope)

## Baseline: API architecture fail вне auth diff

Codex сравнил `git show HEAD:apps/api/src/dashboard/dashboard.service.ts` (line 9) и `git show HEAD:apps/api/src/portfolio/portfolio.service.ts` (line 19): оба уже импортируют `data/fixtures/analyst-portfolio` в HEAD; `git diff` этих двух файлов пуст. Единственный fail `architecture.boundary` (fixtures) подтверждённо вне auth diff — сервисы не менять.

## Fix-origin-focus (2026-11-07)

- Origin: `originMatchesPublicOrigin` now compares **protocol** + host/port; DX loopback peer `localhost`↔`127.0.0.1` only when configured PUBLIC_ORIGIN is loopback.
- Focus: scoped `#pharma-login-form input.login-field:focus-visible` — outline none + 1px soft ring; global `:focus-visible` unchanged; autofill inset kept.
- Evidence: `/tmp/pharma-form-login/fix-origin-focus-summary.json`, `fix-origin-focus-tab-summary.json`, `fix-origin-focus-*.png`, `*-tab-focus.png`, `fix-origin-focus-origin-probes.json`.
- Units: origin/auth jest 25 pass; FE auth 8 pass; both typechecks 0. Browser matrix localhost+127 desktop/mobile ok.
- Tab-focus: исправлена только assertion (active username|password `.login-field` + soft ring); product CSS не меняли. `focusTab.ok=true` ×4.

## Certainty

> **certainty:** assumption
>
> Наблюдения Playwright/curl (не human-approved fact; status `draft`): (1) SnapshotProvider 401→loginClean; (2) Origin 127 403→303; (3) focus outlineStyle none + 1px ring; Tab на username|password валиден. См. `/tmp/pharma-form-login/fix-origin-focus-tab-summary.json`.
