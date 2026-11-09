## Context

Demo v1 FE presents RAG/project status with color-words. Codex-accepted plan: `.cursor/plans/ui-semantics-links-snapshots.md` (corrected §3: Status = due badges; Due = date only).

## Decisions

1. **Single mapper** — `projectStatusLabel`, `ragLabel` in `ui-labels.ts`; known switch only; null/undefined/unknown → «Нет оценки» (never false Green/Critical); Yellow/Amber RAG → «требует внимания»; StatusPill unknown → neutral tone.
2. **Decisions table** — Status column holds due-derived pills; Due column date-only; column title/tooltip explains calendar state ≠ execution; Type uses compact label + full `title`/`aria-label`.
3. **Links** — canonical `hrefForUiRouteRef` in `entity-routes.ts` (EntityRefType + UI-only program/project/workstream/decision); RegisterIdLinks consumes it (no private duplicate switch); KT / empty → muted; DEC → `/decisions?q=`.
4. **Snapshot display** — `snapshotDisplayLabel(id)` = zero-padded ordinal in `SNAPSHOT_IDS`; storage/API letters unchanged.
5. **Decision panel** — header+CTA; context; state; muted honesty note; no thick red frame / nested cards.
6. **Сводка** — rename management-attention; meaningful count labels.
7. **Hydration** — dashboard empty states share one loading label («Загрузка дашборда»).

## Certainty

> **certainty:** assumption — presentation mapping until human approve.
