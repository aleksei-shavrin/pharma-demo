---
id: DOC-HANDOFF-2026-11-08-SCHEDULE-AUTHORED-FACTS
title: 'Handoff: schedule authored control/work facts (open)'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: apps-demo
related:
  - DOC-HANDOFF-2026-11-08-SCHEDULE-REFERENCE-FINAL
---

# Handoff: authored schedule facts

## Мета

- **Session:** `1c199ddd-bdae-4ab6-b70e-7c5d28b6626a`
- **Статус:** data authorship remediation; UI scroll/hover/reference **не** менялись

## Defects fixed

1. Removed `readyPhaseForStableId` rank→100% (MS-COM-GO was 100 on C).
2. EQ/MS: `schedule-control-facts.ts` — 52+44 explicit dates; progress = date≤asOf.
3. Works: WK-01 on A → 0; WK-04 on C → 0; reconcile zeros progress without actualStart after clamp.
4. WBS: full-catalogue identity map (first-id drop persists neighbors).
5. Integrity A–S: FS target@100 ⇒ source@100; work fact coherence.

## Gates

- `apps/api` schedule tests 38/38; `typecheck` 0
- `apps/web` typecheck 0 (UI untouched this pass)
- Evidence: `/tmp/pharma-demo-artifacts/schedule-reference-final-1c199ddd/authored-19.json`

## Limits

- Default EQ/MS dates seeded from catalogue **baseline*** into static map (+ narrative overrides); not live forecast at request time.
- Headed UI visual re-check optional; screens refreshed if percents shifted.
