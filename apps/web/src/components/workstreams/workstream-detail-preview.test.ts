import { describe, expect, it } from 'vitest';
import {
  previewSlice,
  sortAttentionForPreview,
  sortEquipmentForPreview,
  sortMilestonesForPreview,
  WORKSTREAM_SECTION_PREVIEW_LIMIT,
} from './workstream-detail-preview';

describe('workstream-detail-preview', () => {
  it('keeps preview limit at 4', () => {
    expect(WORKSTREAM_SECTION_PREVIEW_LIMIT).toBe(4);
  });

  it('ranks delayed critical equipment first', () => {
    const sorted = sortEquipmentForPreview([
      {
        id: 'EQ-OK',
        name: 'ok',
        critical: false,
        status: 'OnTrack',
        baselineDelivery: '2027-01-01',
        forecastDelivery: '2027-01-01',
      },
      {
        id: 'EQ-HVAC-01',
        name: 'ahu',
        critical: true,
        status: 'Delayed',
        baselineDelivery: '2027-05-15',
        forecastDelivery: '2027-06-05',
      },
      {
        id: 'EQ-DLY',
        name: 'dly',
        critical: false,
        status: 'Delayed',
        baselineDelivery: '2027-02-01',
        forecastDelivery: '2027-03-01',
      },
    ]);
    expect(sorted.map((e) => e.id)).toEqual([
      'EQ-HVAC-01',
      'EQ-DLY',
      'EQ-OK',
    ]);
  });

  it('ranks red milestones before green', () => {
    const sorted = sortMilestonesForPreview([
      {
        id: 'MS-G',
        name: 'g',
        rag: 'Green',
        baselineDate: '2027-01-01',
        forecastDate: '2027-01-10',
      },
      {
        id: 'MS-R',
        name: 'r',
        rag: 'Red',
        baselineDate: '2027-06-01',
        forecastDate: '2027-07-01',
      },
    ]);
    expect(sorted[0]?.id).toBe('MS-R');
  });

  it('ranks red risks and open issues ahead of calm rows', () => {
    const sorted = sortAttentionForPreview(
      [
        { id: 'ISS-CLOSED', title: 'c', status: 'Closed' },
        { id: 'ISS-001', title: 'open', status: 'Open' },
      ],
      [
        { id: 'RISK-G', title: 'g', rag: 'Green' },
        { id: 'RISK-001', title: 'red', rag: 'Red' },
      ],
    );
    expect(sorted.map((r) => r.item.id)).toEqual([
      'RISK-001',
      'ISS-001',
      'RISK-G',
      'ISS-CLOSED',
    ]);
  });

  it('slices overflow and preserves attention head', () => {
    const items = Array.from({ length: 7 }, (_, i) => ({ id: `X-${i}` }));
    const collapsed = previewSlice(items, false, 4);
    expect(collapsed.visible).toHaveLength(4);
    expect(collapsed.overflow).toBe(true);
    expect(collapsed.total).toBe(7);

    const expanded = previewSlice(items, true, 4);
    expect(expanded.visible).toHaveLength(7);
    expect(expanded.overflow).toBe(true);

    const small = previewSlice(items.slice(0, 3), false, 4);
    expect(small.overflow).toBe(false);
    expect(small.visible).toHaveLength(3);
  });
});
