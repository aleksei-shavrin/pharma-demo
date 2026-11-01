---
title: Demo v1 enrichment (continuing)
status: draft
created: 2026-11-01
---

# Demo v1 enrichment

> **Demo v1 continues.** Не Demo v2. Не tag `demo-v1.0.0`.

## Context

- Authoritative product path remains **Demo v1** (Next + Nest + mock fixtures + Compose).
- Implementation plan I1–I8 is a **historical** baseline: [`.cursor/plans/demo-v1-implementation.md`](./demo-v1-implementation.md) — **exhausted at I8**; do **not** reopen or invent I9 there.
- Presentation hardening and Live Presentation Guide are closed deliverables on that baseline.

## Development workflow (this track)

- Dev stack: `docker-compose.dev.yml` + `npm run dev` / `npm run dev:down`
- Production-like Demo: `docker compose --profile app` (unchanged)
- Same URLs: `localhost` / `api.localhost` / `docs.localhost`

## Future product / data enrichment

Placeholder only — not designed in this pass:

- richer Demo scenarios / data (beyond current A/B/C narrative);
- incremental product capabilities while staying Demo v1.

Track future work in this plan (or successor), **not** by extending I1–I8 numbering.
