/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { SCHEDULE_ROW_HEIGHT_PX } from '@/lib/schedule/schedule-geometry';
import { forwardWheelDeltaToOwner } from '@/lib/schedule/schedule-scroll-anchor';

describe('forwardWheelDeltaToOwner', () => {
  it('does not steal ctrl+wheel (browser zoom)', () => {
    const owner = document.createElement('div');
    Object.defineProperty(owner, 'clientHeight', { value: 400 });
    owner.scrollTop = 100;
    const preventDefault = vi.fn();
    const applied = forwardWheelDeltaToOwner(
      {
        ctrlKey: true,
        metaKey: false,
        deltaX: 0,
        deltaY: 120,
        deltaMode: 0,
        preventDefault,
      },
      owner,
      SCHEDULE_ROW_HEIGHT_PX,
    );
    expect(applied).toBe(false);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(owner.scrollTop).toBe(100);
  });

  it('passes horizontal wheel to the browser', () => {
    const owner = document.createElement('div');
    Object.defineProperty(owner, 'clientHeight', { value: 400 });
    owner.scrollTop = 100;
    const preventDefault = vi.fn();
    expect(
      forwardWheelDeltaToOwner(
        {
          ctrlKey: false,
          metaKey: false,
          deltaX: 80,
          deltaY: 10,
          deltaMode: 0,
          preventDefault,
        },
        owner,
        SCHEDULE_ROW_HEIGHT_PX,
      ),
    ).toBe(false);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(owner.scrollTop).toBe(100);
  });

  it('normalizes DOM_DELTA_LINE and DOM_DELTA_PAGE', () => {
    const owner = document.createElement('div');
    Object.defineProperty(owner, 'clientHeight', { value: 400 });
    owner.scrollTop = 0;
    const preventDefault = vi.fn();
    expect(
      forwardWheelDeltaToOwner(
        {
          ctrlKey: false,
          metaKey: false,
          deltaX: 0,
          deltaY: 2,
          deltaMode: 1,
          preventDefault,
        },
        owner,
        SCHEDULE_ROW_HEIGHT_PX,
      ),
    ).toBe(true);
    expect(owner.scrollTop).toBe(2 * SCHEDULE_ROW_HEIGHT_PX);

    owner.scrollTop = 0;
    expect(
      forwardWheelDeltaToOwner(
        {
          ctrlKey: false,
          metaKey: false,
          deltaX: 0,
          deltaY: 1,
          deltaMode: 2,
          preventDefault,
        },
        owner,
        SCHEDULE_ROW_HEIGHT_PX,
      ),
    ).toBe(true);
    expect(owner.scrollTop).toBe(400);
  });
});
