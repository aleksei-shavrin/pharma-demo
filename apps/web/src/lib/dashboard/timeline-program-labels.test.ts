/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  TIMELINE_PORTFOLIO_LANE_KEY,
  TIMELINE_PROGRAM_ORDER,
  timelineProgramLabel,
  timelineProgramVisualTopDownIds,
} from './timeline-program-labels';

describe('timeline-program-labels', () => {
  it('portfolio caption is Портфель only; key stays none', () => {
    expect(TIMELINE_PORTFOLIO_LANE_KEY).toBe('none');
    expect(timelineProgramLabel('none')).toBe('Портфель');
    expect(timelineProgramLabel('none')).not.toMatch(/без программы/);
    expect(timelineProgramLabel('PRG-CON')).toBe('Строительство');
  });

  it('visual top-down matches chart (source order unchanged, new array)', () => {
    const present = [...TIMELINE_PROGRAM_ORDER];
    const topDown = timelineProgramVisualTopDownIds(present);
    expect(TIMELINE_PROGRAM_ORDER[0]).toBe('PRG-DSN');
    expect(TIMELINE_PROGRAM_ORDER.at(-1)).toBe('none');
    expect(topDown[0]).toBe('none');
    expect(topDown.at(-1)).toBe('PRG-DSN');
    expect(topDown).toEqual([
      'none',
      'PRG-ORG',
      'PRG-STA',
      'PRG-DIG',
      'PRG-EQP',
      'PRG-ENG',
      'PRG-CON',
      'PRG-DSN',
    ]);
    expect(topDown).not.toBe(present);
  });
});
