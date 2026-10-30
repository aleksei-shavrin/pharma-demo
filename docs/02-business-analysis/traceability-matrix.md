---
id: DOC-BA-016
title: "Traceability matrix (BA/PD Demo v1)"
type: business
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-BA-017
  - DOC-PROD-010
---

# Traceability matrix (BA/PD Demo v1)

Цепочка: Problem → Process → BR → Capability → REQ → AC/Walkthrough → Mock.

| Problem | Process | BR | Capability | REQ | Walkthrough / Mock |
|---------|---------|-----|------------|-----|--------------------|
| P-001, P-002 | PROC-007 | BR-001, BR-004 | C-03 | REQ-EQPT-001 | Steps 1–2; EQ-HVAC-01 |
| P-001, P-002 | PROC-005, PROC-004 | BR-001, BR-002 | C-04 | REQ-RISK-001 | Steps 2–3; ISS-001, RISK-001 |
| P-001, H-002 | PROC-010 | BR-003, BR-004 | C-02 | REQ-MILE-001 | Steps 1, 4; MS-PS |
| P-001, H-002 | PROC-001 | BR-004 | C-01 / C-03 | REQ-PROJ-001, REQ-EQPT-001 | Forecast dates |
| P-002, H-002 | PROC-011 | BR-005, BR-006, BR-007 | C-05 | REQ-IMPCT-001, REQ-IMPCT-002 | Steps 4–5; DEC-001 |
| — | — | — | architecture | REQ-NFR-001, REQ-NFR-002 | Demo constraints |

## Explicit non-edges

| Candidate | Status |
|-----------|--------|
| PROC-002/003/006/008/009 | out — no REQ |
| C-06/C-07 | out of Must |
| SCN-006 | optional only |

> **certainty:** hypothesis
>
> Связи обоснованы BA2–PD3; не enterprise process confirmation.
