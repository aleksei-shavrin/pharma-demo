import { expandSeamAtomicEdges, parseAnalystFixture } from './analyst-parser';

describe('critical seam arrow-group expansion', () => {
  it('fan-out: 24.1.3 → 9.3.2,12.2.3,19.3 = three outgoing from 24.1.3', () => {
    const edges = expandSeamAtomicEdges('24.1.3 → 9.3.2, 12.2.3, 19.3');
    expect(edges).toEqual([
      { fromWbs: '24.1.3', toWbs: '9.3.2', arrow: 'intra' },
      { fromWbs: '24.1.3', toWbs: '12.2.3', arrow: 'intra' },
      { fromWbs: '24.1.3', toWbs: '19.3', arrow: 'intra' },
    ]);
  });

  it('chain: 5.3.3 → 5.4.2 → 6.1 = two successive edges', () => {
    const edges = expandSeamAtomicEdges('5.3.3 → 5.4.2 → 6.1');
    expect(edges).toEqual([
      { fromWbs: '5.3.3', toWbs: '5.4.2', arrow: 'intra' },
      { fromWbs: '5.4.2', toWbs: '6.1', arrow: 'intra' },
    ]);
  });

  it('parsed seams expose exact atomic edge sets (7 seams)', () => {
    const parsed = parseAnalystFixture();
    expect(parsed.seams).toHaveLength(7);
    const power = parsed.seams.find((s) => s.rawDependency.includes('24.1.3'));
    expect(power!.atomicEdges).toHaveLength(3);
    expect(power!.atomicEdges.every((e) => e.fromWbs === '24.1.3')).toBe(true);
    const chain = parsed.seams.find((s) =>
      s.rawDependency.includes('5.3.3 → 5.4.2 → 6.1'),
    );
    expect(chain!.atomicEdges).toEqual([
      { fromWbs: '5.3.3', toWbs: '5.4.2', arrow: 'intra' },
      { fromWbs: '5.4.2', toWbs: '6.1', arrow: 'intra' },
    ]);
    const totalAtomic = parsed.seams.reduce(
      (n, s) => n + s.atomicEdges.length,
      0,
    );
    // 3+1+1+2+2+1+2 = 12
    expect(totalAtomic).toBe(12);
  });
});
