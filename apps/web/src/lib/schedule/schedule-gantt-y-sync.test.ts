/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import {
  expectedGanttYMax,
  ensureVerScrollRange,
  ganttYScrollRangeHealthy,
  PPC_VER_SPACER_ATTR,
  ySyncAligned,
} from './schedule-gantt-y-sync';
import { SCHEDULE_ROW_HEIGHT_PX } from './schedule-geometry';

describe('schedule-gantt-y-sync', () => {
  const viewportHeight = 500;
  const rowCount = 688;
  const need = expectedGanttYMax(rowCount, viewportHeight);

  it('marks zero and half ranges unhealthy', () => {
    expect(
      ganttYScrollRangeHealthy({
        nativeYMax: 0,
        rowCount,
        viewportHeight,
      }),
    ).toBe(false);
    expect(
      ganttYScrollRangeHealthy({
        nativeYMax: Math.floor(need / 2),
        rowCount,
        viewportHeight,
      }),
    ).toBe(false);
  });

  it('marks double rail unhealthy', () => {
    expect(
      ganttYScrollRangeHealthy({
        nativeYMax: need * 2,
        rowCount,
        viewportHeight,
      }),
    ).toBe(false);
  });

  it('accepts full required range within tolerance', () => {
    expect(need).toBe(rowCount * SCHEDULE_ROW_HEIGHT_PX - viewportHeight);
    expect(
      ganttYScrollRangeHealthy({
        nativeYMax: need,
        rowCount,
        viewportHeight,
      }),
    ).toBe(true);
    expect(
      ganttYScrollRangeHealthy({
        nativeYMax: need + 40,
        rowCount,
        viewportHeight,
      }),
    ).toBe(true);
  });

  it('requires requested native Y alignment within 2px', () => {
    expect(ySyncAligned(11000, 11000)).toBe(true);
    expect(ySyncAligned(11000, 0)).toBe(false);
  });
});

function mockVer(scrollHeightChildren: boolean) {
  const ver = document.createElement('div');
  Object.defineProperty(ver, 'clientHeight', { value: 500, configurable: true });
  Object.defineProperty(ver, 'scrollTop', { value: 0, writable: true });
  if (scrollHeightChildren) {
    Object.defineProperty(ver, 'scrollHeight', {
      get: () =>
        [...ver.children].reduce(
          (sum, el) =>
            sum + (parseInt((el as HTMLElement).style.height, 10) || 0),
          0,
        ),
      configurable: true,
    });
  } else {
    Object.defineProperty(ver, 'scrollHeight', {
      value: 500,
      configurable: true,
      writable: true,
    });
  }
  return ver;
}

describe('ensureVerScrollRange (jsdom)', () => {
  it('does not stack a second spacer when vendor already has full height', () => {
    const ver = mockVer(true);
    const vendorInner = document.createElement('div');
    vendorInner.style.height = `${688 * 32}px`;
    ver.appendChild(vendorInner);
    const leak = document.createElement('div');
    leak.setAttribute(PPC_VER_SPACER_ATTR, 'true');
    leak.style.height = `${688 * 32}px`;
    ver.appendChild(leak);

    const first = ensureVerScrollRange(ver, 688, 500);
    expect(ver.querySelectorAll(`[${PPC_VER_SPACER_ATTR}="true"]`).length).toBe(
      0,
    );
    expect(first.usedProjectSpacer).toBe(false);

    const second = ensureVerScrollRange(ver, 688, 500);
    expect(second.usedProjectSpacer).toBe(false);
    expect(ver.querySelectorAll(`[${PPC_VER_SPACER_ATTR}="true"]`).length).toBe(
      0,
    );
  });

  it('adds one spacer only when vendor range is empty', () => {
    const ver = mockVer(true);
    const result = ensureVerScrollRange(ver, 688, 500);
    expect(result.usedProjectSpacer).toBe(true);
    expect(ver.querySelectorAll(`[${PPC_VER_SPACER_ATTR}="true"]`).length).toBe(
      1,
    );
    ensureVerScrollRange(ver, 688, 500);
    expect(ver.querySelectorAll(`[${PPC_VER_SPACER_ATTR}="true"]`).length).toBe(
      1,
    );
  });
});
