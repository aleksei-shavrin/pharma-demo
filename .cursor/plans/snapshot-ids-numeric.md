# SnapshotId numeric-only migration (`01`…`19`)

> **certainty:** assumption — выполнен по явному решению пользователя (уход от буквенной идентификации снимков). Не human-approved fact.

## Canon

- `SnapshotId` = `'01' | … | '19'` (zero-pad strings) в FE/BE/API/fixtures/DOM/query/session.
- Default / omit query = `'01'`.
- Letters / bare `1` / `001` / `00` / `20` → API **400** (no alias).
- sessionStorage: только numeric; legacy/invalid → clear + bootstrap `'01'` (без letter→ordinal map).
- Chronology/dates/scenario semantics сохранены (A→01 … S→19).

## Order done

1. Baseline fixtures A–S → `/tmp/pharma-snapshots-numeric/baseline/`
2. Doc-first GUIDE DOC-GUIDE-001 numeric-only
3. Test First FAIL → implement → PASS
4. Apps + fixtures + consumers; docs/OpenSpec current sync
5. Gates + Playwright `:3080` all 19

## Evidence

`/tmp/pharma-snapshots-numeric/` — baseline, semantics-compare, TestFirst logs, browser-report, residual-inventory.

## Explicit non-goals

- Не переписывать historical reports/handoffs как будто букв не было.
- Не трогать observation fixture ids (`id: 'A'`) и cleanroom «C/D».
- Не dual-API.
