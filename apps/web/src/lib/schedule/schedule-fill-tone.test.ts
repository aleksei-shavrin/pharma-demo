import { describe, expect, it } from 'vitest';
import { resolveScheduleFillTone } from './schedule-fill-tone';

describe('resolveScheduleFillTone', () => {
  it('maps work Delayed→danger, Waiting→warn, Completed→ok', () => {
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'Delayed',
        warningTone: 'none',
      }),
    ).toBe('danger');
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'Waiting',
        warningTone: 'none',
      }),
    ).toBe('warn');
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'Completed',
        warningTone: 'none',
      }),
    ).toBe('ok');
  });

  it('warning lag overrides status to danger', () => {
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'OnSchedule',
        warningTone: 'lag',
      }),
    ).toBe('danger');
  });

  it('milestone RAG Red→danger', () => {
    expect(
      resolveScheduleFillTone({
        kind: 'milestone',
        rag: 'Red',
        warningTone: 'none',
      }),
    ).toBe('danger');
  });

  it('covers shift/equipment/amber/group branches', () => {
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'Completed',
        warningTone: 'shift',
      }),
    ).toBe('warn');
    expect(
      resolveScheduleFillTone({
        kind: 'equipment_delivery',
        status: 'Delayed',
        warningTone: 'none',
      }),
    ).toBe('danger');
    expect(
      resolveScheduleFillTone({
        kind: 'equipment_delivery',
        status: 'OnTrack',
        warningTone: 'none',
      }),
    ).toBe('ok');
    expect(
      resolveScheduleFillTone({
        kind: 'milestone',
        rag: 'Yellow',
        warningTone: 'none',
      }),
    ).toBe('warn');
    expect(
      resolveScheduleFillTone({
        kind: 'milestone',
        rag: 'Amber',
        warningTone: 'none',
      }),
    ).toBe('warn');
    expect(
      resolveScheduleFillTone({
        kind: 'milestone',
        rag: 'Green',
        warningTone: 'none',
      }),
    ).toBe('ok');
    expect(
      resolveScheduleFillTone({
        kind: 'stage_group',
        warningTone: 'none',
      }),
    ).toBe('ok');
  });
});
