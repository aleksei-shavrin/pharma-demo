---
id: DOC-HANDOFF-2026-11-08-PERF-STYLE
title: 'Handoff: r4virt resize clip + r3 overlays/range'
type: handoff
status: draft
version: 0.6.0
created: '2026-11-08'
updated: '2026-11-08'
owner: demo-engineering
---

# Handoff: r4virt (resize) + r3virt

## r4virt — host height после window resize

**Корень:** `ResizeObserver` слушал `.ppc-gantt-host` с fixed `height/maxHeight` из `fitHostToViewport`. Родитель `.ppc-gantt-viewport` рос при 1440→1920, host не менялся → fit не вызывался → chart короче table (~40px white band), ромб KT-25.6.3 clipped.

**Fix:** observe `resolveGanttResizeObserveTarget` → `.ppc-gantt-viewport`; idempotent `fitHostBoxNeedsUpdate` + `data-gantt-fit-*`; после реального fit — `syncOwnedVerticalScroll(ownedScrollTop)`. Без повторного вычитания header 40 / Hbar 15.

**Evidence:** `/tmp/pharma-demo-artifacts/pharma-perf-style-1c199ddd/r4virt-evidence.json`, screens `r4virt-baseline-end-C-1920.png`, `r4virt-baseline-end-C-1440-after-resize.png`.

| Probe end@1920 | |
|---|---|
| hostH / viewportH | 696 / 696 |
| Δtop table↔chart | 0 |
| diamond KT-25.6.3 | fullyInside, 6×6 @ top 1014 |
| whiteBand | 0 |
| nativeY == ownerY | 21321 |

## r3virt (сохранено)

Overlays on scroll; Y max ≈21558 (не double); steady wheel/hover ~16.7ms / blocking 0.

## Limits

- Old BEFORE C via `?snapshot=` still unverified.
- No commit/push.
