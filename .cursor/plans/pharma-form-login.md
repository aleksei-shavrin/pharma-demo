---
name: Pharma form login
overview: "Demo form-login/logout in Next+Nest same-origin (:3080). Nest owns cookie/session; Next UI+middleware. Session dbf0df0f-368e-4c1a-a9ff-1a2af77dc22b."
todos:
  - id: T-DOCS
    content: OpenSpec demo-v1-form-login + ADR-0007 draft + UX/ops
    status: completed
  - id: T-API
    content: Nest AuthModule bcrypt/AES-GCM/guards/tests
    status: completed
  - id: T-WEB
    content: Login UI, middleware, logout, api-client credentials
    status: completed
  - id: T-ENV
    content: Credential bootstrap + compose mounts (after schedule idle on shared)
    status: completed
  - id: T-QA
    content: typecheck/unit/build/coverage + docs gates
    status: completed
  - id: T-BROWSER
    content: Playwright desktop/mobile + HMR + handoff
    status: completed
  - id: T-HARDEN
    content: Review fixes — allowlist, Caddy strip bypass, no-store, server auth, coverage 4 metrics
    status: completed
  - id: T-LOGIN-ERROR
    content: Fix SnapshotProvider anonymous dashboard 401 on /login; rewrite browser evidence
    status: completed
  - id: T-FIX-ORIGIN-FOCUS
    content: "Fix-origin-focus: DX loopback Origin peers + login input focus ring"
    status: completed
isProject: true
---

# Pharma form login

**Executor session:** `dbf0df0f-368e-4c1a-a9ff-1a2af77dc22b`
**Canonical plan:** `.cursor/plans/pharma-form-login.md`
**DX URL:** `http://localhost:3080` — leave up
**OpenSpec/ADR:** draft only — **not** human-approved; living apply/archive **not** done

## Checklist (done)

1. [x] **T-DOCS** — OpenSpec change + ADR-0007 draft (not approved)
2. [x] **T-API** — Nest AuthModule + SessionGuard
3. [x] **T-WEB** — `/login`, middleware, logout icon
4. [x] **T-CLIENT** — `credentials:'include'`
5. [x] **T-ENV** — DX + server auth bootstrap (separate secrets)
6. [x] **T-TEST** — unit + browser + hardening
7. [x] **T-QA** — typecheck/unit/build + docs gates
8. [x] **T-HARDEN** — dotted allowlist; strip `x-middleware-subrequest`; no-store; server compose auth; coverage 4 metrics
9. [x] **T-LOGIN-ERROR** — SnapshotProvider skips bootstrap on `/login`; browser loginClean

## Evidence (final review 2026-11-07)

- Pre: `/login` console `Failed to load resource: 401` → `/backend/v1/.../dashboard?snapshot=A` (Next «1 error»); pageErrors=[]
- Fix: `SnapshotProvider` `usePathname` + skip `runLoad` on login; TestFirst `snapshot-context.login-skip.test.tsx`
- Post: diagnose + acceptance — console/page/failed/unexpected HTTP empty; no auto dashboard 401; overlay hasErrorBadge=false
- Full units: `npm run web:test` → **0** (373); `npm run api:test` → **1** (239 pass + pre-existing architecture.boundary fixtures — not auth)
- Docs: frontmatter/ids/certainty/portal **0**; auth markdownlint **0**
- Browser: `/tmp/pharma-form-login/summary.json` ok + loginClean; screenshots rewritten
- Living OpenSpec apply: **blocked** — human review (AGENTS §7)

## Fix-origin-focus (done)

**Status:** completed · session `dbf0df0f-368e-4c1a-a9ff-1a2af77dc22b`
**Refs:** thick teal focus; `127.0.0.1` → Forbidden JSON (pre-fix)

### Root-cause evidence (runtime, no secrets)

- `PUBLIC_ORIGIN` / `WEB_ORIGIN` host = **`localhost:3080`** (`.env.local` / `.env.dev-auth`).
- Live POST probes to `http://127.0.0.1:3080/backend/v1/auth/login`:
  - `Origin: http://127.0.0.1:3080` → **403** `{"message":"Forbidden"}` (matches user screenshot)
  - `Origin: http://localhost:3080` → **303** wrong-password redirect (auth path OK)
  - `Origin: http://evil.example:3080` → **403**
- Code path: [`originMatchesPublicOrigin`](apps/api/src/auth/origin.ts) strict scheme+host+port vs `PUBLIC_ORIGIN`; [`auth.controller`](apps/api/src/auth/auth.controller.ts) returns 403 JSON on fail.
- Focus: global [`globals.css`](apps/web/src/app/globals.css) `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px }` **plus** [`sign-in-screen.tsx`](apps/web/src/components/auth/sign-in-screen.tsx) `.login-field` `focus-visible:ring-2` — `outline-none` loses to `:focus-visible` specificity → double thick teal ring (screenshot).

### Chosen origin solution

**DX loopback peer allowlist inside `originMatchesPublicOrigin`:** if `publicOrigin` hostname is `localhost` **or** `127.0.0.1`, accept Origin when scheme+port match and Origin host is the other loopback peer (`localhost`↔`127.0.0.1`). Non-loopback `PUBLIC_ORIGIN` (prod) stays **strict single-origin**. Still reject wrong ports, foreign hosts, missing/null Origin. Do **not** disable Origin check / CORS / guard; do **not** force user to pick the “right” URL.

### Focus solution

Scoped **only** `#pharma-login-form input.login-field:focus-visible` (and remember if needed for consistency): kill global outline locally; one soft border/ring (`--login-accent-ring` or thin border accent). Keyboard focus remains visible. **Do not** change global `:focus-visible` for the rest of the app.

### Exact files (implementation wave)

1. Docs draft first: [`openspec/changes/demo-v1-form-login/design.md`](openspec/changes/demo-v1-form-login/design.md) decision §5 + [`docs/10-operations/demo-form-login.md`](docs/10-operations/demo-form-login.md) loopback note; handoff append; ADR-0007 note if needed (status stays draft).
2. API: [`apps/api/src/auth/origin.ts`](apps/api/src/auth/origin.ts) + TestFirst [`origin.spec.ts`](apps/api/src/auth/origin.spec.ts) / branches — fail then pass for loopback peers; reject evil/port; prod strict.
3. FE: [`apps/web/src/app/globals.css`](apps/web/src/app/globals.css) scoped login focus override; soft-tune [`sign-in-screen.tsx`](apps/web/src/components/auth/sign-in-screen.tsx) ring classes; FE unit if present / small CSS assertion via Playwright computed styles.
4. Browser: **both** `http://localhost:3080` and `http://127.0.0.1:3080` — desktop+mobile; real Tab focus + measure `outline`/`box-shadow`/`outlineWidth`; wrong password → in-form error; correct + remember + logout. Evidence under `/tmp/pharma-form-login/`.
5. Out of scope: schedule track, other repos, credentials rotation, Nest guard disable, global focus redesign. Leave DX `:3080` up; no commit unless asked.

### TestFirst → passing (evidence)

- API `jest --testPathPatterns='origin|login-decision|logout-decision|auth.service|auth.controller'` → **0** (25 pass). Pre-fix: loopback peer + http≠https failed as expected.
- FE auth vitest → **0** (8). `typecheck:api` / `typecheck:web` → **0**.
- Live Origin: before 127→**403** Forbidden; after →**303** wrong-password redirect (`fix-origin-focus-origin-probes.json`).
- Browser matrix both hosts × desktop/mobile → **0** (`fix-origin-focus-summary.json` ok). Focus: `outlineStyle=none` + `box-shadow 0 0 0 1px` (soft). Wrong (desktop/host) stays on styled form; correct deep+query; API 200→401. Screenshots `fix-origin-focus-*.png`.
- Tab-focus review: prior `focusTab.ok=false` (active=password) was a **bad assertion** (Tab past username is valid). Retest GET-only → `fix-origin-focus-tab-summary.json` + patched summary: `focusTab.ok=true` for username|password `.login-field` + soft ring. Shots `*-tab-focus.png`. No product change; no full login matrix redo.
- API restart once to clear in-memory rate-limit (limit 5) after probes — no volumes deleted. Dev `:3080` left up.
