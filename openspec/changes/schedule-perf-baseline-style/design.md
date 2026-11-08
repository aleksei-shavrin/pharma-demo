# Design: schedule virtualization + baseline primary

## Decisions

1. **One Y owner** — existing `[data-schedule-scroll-owner]`. Native Gantt ver bar stays hidden and is not an input owner.
2. **Full model, windowed DOM** — `clearAll`/`parse` once per data/mode/filter; never window-slice parse on scroll (preserves offscreen link endpoints in the model).
3. **React** — `computeScheduleVirtualWindow` + top/bottom spacers; mount only `[start,end)`.
4. **DHTMLX** — `smart_rendering=true`; host height = chart viewport; `gantt.scrollTo(x, ownedScrollTop)` from owner rAF.
5. **Overlays** — cull by visible Y band + overscan.
6. **Baseline summary** — `buildVisibleScheduleRows({ comparison })` rolls leaf baseline (or actual shown-fact) into group bounds.
7. **Markers** — CSS mirrors forecast primary rules onto `.ppc-role-baseline`.

## Certainty

> **certainty:** assumption — Community `smart_rendering` keeps full task/link model while limiting DOM; verified by browser DOM counts + logical 688/679.
