/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import type { ScheduleWorkItem } from '@/lib/api-client';
import {
  parseSelectionKeyId,
  selectionKeyId,
  selectionKeyOf,
} from './selection-key';

const work: ScheduleWorkItem = {
  kind: 'work',
  id: 'WK-01',
  name: 'Монтаж',
  startDate: '2027-06-01',
  endDate: '2027-06-02',
  status: 'Waiting',
};

describe('selection-key: работы', () => {
  it('ключ работы round-trip через id', () => {
    const key = selectionKeyOf(work);
    expect(key).toEqual({ kind: 'work', entityId: 'WK-01' });
    expect(selectionKeyId(key)).toBe('work:WK-01');
    expect(parseSelectionKeyId('work:WK-01')).toEqual(key);
  });

  it('неизвестный kind не парсится', () => {
    expect(parseSelectionKeyId('task:WK-01')).toBeNull();
  });
});
