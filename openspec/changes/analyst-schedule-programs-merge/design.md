## Context

Файл аналитика описывает одну программу Greenfield и 25 проектов. В Demo UI уже согласованы **7 программ PRG-*** и **25 AN-*** (ADR/portfolio). Имя Greenfield в приложении — portfolio `PRJ-01` (coarsened context), не повод схлопывать 7→1.

## Decisions

1. **Hierarchy:** keep `PRJ-01` → 7 `PRG-*` → 25 `AN-*`. Source «одна программа» → provenance mapping only.
2. **WorkstreamId:** internal tag + compatibility redirects. User nav/filters = Program/Project. Mapping WS→AN→PRG explicit in `ws-program-mapping.ts`.
3. **Schedule SoT:** parse `demo-pharma-greenfield.md` (sha256 pinned). Stages→`stage_group`, Работа/КТ→`work` (КТ dedupe to catalog MS when alias exists).
4. **Links:** expand ranges/commas/mixed arrows; keep raw edges; project stage/project refs to leaves for render; unresolved/cycles reported, not silently dropped.
5. **Dates/progress:** not in source. Anchor snapshot **C** = DEMO_ASSUMPTION for source status tokens. Supplementary authored facts in BE only.
6. **Collisions:** analyst WBS wins; obsolete synthetic `1.1/5.1/6.1/7.1/10.1` remap/retire with audit; EQ52/MS44 reparent; MS↔KT aliases (e.g. `8.2.3`≡`MS-CLN-PANEL`).

## Risks

- Large row count (~560+EQ/MS) vs smart_rendering off — measure in browser.
- E01 walkthrough already assumes 7 PRG — preserved.
- Link rule extension for analyst cross-deps may need adapter kind.
