import { SNAPSHOTS } from '../data/fixtures';
import type { SnapshotFixture } from '../data/fixtures/types';
import { decisionPanelState, forecastDeviationOf } from './derived-impact';

describe('decisionPanelState PS-driver scope', () => {
  it('A absent; C/E needed without DEC-001', () => {
    expect(decisionPanelState(SNAPSHOTS['01'])).toBe('absent');
    expect(decisionPanelState(SNAPSHOTS['03'])).toBe('needed');
    expect(decisionPanelState(SNAPSHOTS['05'])).toBe('needed');
  });

  it('F recorded via DEC-001', () => {
    expect(decisionPanelState(SNAPSHOTS['06'])).toBe('recorded');
  });

  it('non-DEC-001 decisions alone do not become recorded', () => {
    const base = SNAPSHOTS['05'];
    const withOther: SnapshotFixture = {
      ...base,
      decisions: [
        {
          id: 'DEC-UTL-01',
          projectId: 'PRT-01',
          milestoneId: 'MS-UTL-WFI',
          type: 'PrioritizeRecovery',
          ownerPersonId: 'PER-09',
          dueDate: '2027-05-20',
          note: 'test-only other decision',
        },
      ],
    };
    expect(withOther.decisions.some((d) => d.id === 'DEC-001')).toBe(false);
    expect(decisionPanelState(withOther)).toBe('needed');
  });

  it('forecastDeviation independent of panel state', () => {
    expect(forecastDeviationOf(SNAPSHOTS['01'])).toBe('within_baseline');
    expect(forecastDeviationOf(SNAPSHOTS['06'])).toBe('deviation_persists');
  });
});
