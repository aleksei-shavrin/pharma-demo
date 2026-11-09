export type SchedulePopoverAnchorPoint = {
  left: number;
  top: number;
  placeAbove: boolean;
};

export type SchedulePopoverPanelSize = {
  width: number;
  height: number;
};

const EDGE = 8;

/**
 * Place a fixed popover relative to an owner rect so the measured panel
 * stays inside the viewport (flip above/below + clamp X/Y). No translate(-50%).
 */
export function placeScheduleChartPopover(
  owner: { left: number; top: number; right: number; bottom: number; width: number },
  panel: SchedulePopoverPanelSize,
  viewport: { width: number; height: number } = {
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  },
): SchedulePopoverAnchorPoint {
  const width = Math.max(1, panel.width || 280);
  const height = Math.max(1, panel.height || 120);
  const vw = Math.max(1, viewport.width);
  const vh = Math.max(1, viewport.height);

  const spaceBelow = vh - owner.bottom - EDGE;
  const spaceAbove = owner.top - EDGE;
  const placeAbove = spaceBelow < height && spaceAbove > spaceBelow;

  let left = owner.left + owner.width / 2 - width / 2;
  left = Math.min(Math.max(EDGE, left), vw - width - EDGE);

  let top = placeAbove ? owner.top - EDGE - height : owner.bottom + EDGE;
  top = Math.min(Math.max(EDGE, top), vh - height - EDGE);

  return { left, top, placeAbove };
}
