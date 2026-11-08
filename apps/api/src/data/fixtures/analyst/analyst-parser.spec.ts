import {
  ANALYST_EXPECTED,
  ANALYST_SOURCE_SHA256,
  expandDepEndpoints,
  expandSeamAtomicEdges,
  parseAnalystFixture,
  parseAnalystMarkdown,
  parseSourceStatus,
  projectEdgeToLeaves,
} from './analyst-parser';

describe('analyst-parser', () => {
  it('pinned sha256 and exact golden totals', () => {
    const parsed = parseAnalystFixture();
    expect(parsed.sha256).toBe(ANALYST_SOURCE_SHA256);
    expect(parsed.projects).toHaveLength(ANALYST_EXPECTED.projects);
    expect(parsed.rows).toHaveLength(ANALYST_EXPECTED.rows);
    expect(parsed.rows.filter((r) => r.kind === 'stage')).toHaveLength(
      ANALYST_EXPECTED.stages,
    );
    expect(parsed.rows.filter((r) => r.kind === 'work')).toHaveLength(
      ANALYST_EXPECTED.works,
    );
    expect(parsed.rows.filter((r) => r.kind === 'checkpoint')).toHaveLength(
      ANALYST_EXPECTED.checkpoints,
    );
    expect(parsed.seams).toHaveLength(ANALYST_EXPECTED.criticalSeams);
    const wbs = parsed.rows.map((r) => r.wbs);
    expect(new Set(wbs).size).toBe(wbs.length);
  });

  it('parses status tokens including warn weeks', () => {
    expect(parseSourceStatus('✅')).toEqual({
      sourceStatus: 'completed',
      sourceWeeks: null,
    });
    expect(parseSourceStatus('⚠️2н')).toEqual({
      sourceStatus: 'delayed',
      sourceWeeks: 2,
    });
    expect(parseSourceStatus('❌').sourceStatus).toBe('missed');
    expect(parseSourceStatus('🔄').sourceStatus).toBe('in_progress');
    expect(parseSourceStatus('⏳').sourceStatus).toBe('waiting');
  });

  it('expands comma lists', () => {
    expect(expandDepEndpoints('1.1.1,1.1.2').map((r) => r.wbs)).toEqual([
      '1.1.1',
      '1.1.2',
    ]);
  });

  it('expands inclusive ranges', () => {
    expect(expandDepEndpoints('1.2.1–1.2.3').map((r) => r.wbs)).toEqual([
      '1.2.1',
      '1.2.2',
      '1.2.3',
    ]);
  });

  it('keeps every explicit edge from mixed arrows', () => {
    const md = `
## 1. Sample

| ID | Тип | Название | Связи | Статус |
|---|---|---|---|---|
| 1.1 | Этап | A | — | ✅ |
| 1.1.1 | Работа | B | — | ✅ |
| 1.1.2 | Работа | C | — | ✅ |
| 1.1.3 | КТ | D | 1.1.1,1.1.2 → | ✅ |
| 1.2 | Этап | E | 1.1 → | 🔄 |
| 1.2.1 | Работа | F | 2.1.3 ⇢, 1.1.3 → | 🔄 |
`;
    const parsed = parseAnalystMarkdown(md);
    const toF = parsed.edges.filter((e) => e.toOwnerWbs === '1.2.1');
    expect(toF).toHaveLength(2);
    expect(toF.map((e) => e.arrow).sort()).toEqual(['cross', 'intra']);
    const fromIds = toF.flatMap((e) => e.from.map((f) => f.wbs)).sort();
    expect(fromIds).toEqual(['1.1.3', '2.1.3']);
  });

  it('normalizes critical seams without dropping endpoints', () => {
    const parsed = parseAnalystFixture();
    const seam = parsed.seams.find((s) => s.rawDependency.includes('24.1.3'));
    expect(seam).toBeTruthy();
    expect(seam!.endpoints).toEqual(
      expect.arrayContaining(['24.1.3', '9.3.2', '12.2.3', '19.3']),
    );
  });

  it('projects stage refs to direct leaves', () => {
    const parsed = parseAnalystFixture();
    const edge = parsed.edges.find(
      (e) => e.toOwnerWbs === '1.2' && e.from.some((f) => f.wbs === '1.1'),
    );
    expect(edge).toBeTruthy();
    const projected = projectEdgeToLeaves(edge!, parsed.rows);
    expect(projected.from.length).toBeGreaterThan(0);
    expect(projected.to.length).toBeGreaterThan(0);
  });

  it('reports status contradictions without deleting edges', () => {
    const parsed = parseAnalystFixture();
    expect(parsed.edges.length).toBeGreaterThan(400);
    // Contradictions are informational; edges stay.
    expect(Array.isArray(parsed.statusContradictions)).toBe(true);
  });

  it('covers status/range/seam/cycle/contradiction edge branches', () => {
    expect(parseSourceStatus('⚠').sourceWeeks).toBeNull();
    expect(parseSourceStatus('plain').sourceStatus).toBe('waiting');
    expect(expandDepEndpoints('—')).toEqual([]);
    expect(expandDepEndpoints('-')).toEqual([]);
    expect(expandDepEndpoints('')).toEqual([]);
    // unequal depth / mismatched prefix / reversed range → endpoints only
    expect(expandDepEndpoints('1.1–1.1.2').map((r) => r.wbs)).toEqual([
      '1.1',
      '1.1.2',
    ]);
    expect(expandDepEndpoints('1.2.3–1.3.1').map((r) => r.wbs)).toEqual([
      '1.2.3',
      '1.3.1',
    ]);
    expect(expandDepEndpoints('1.2.3–1.2.1').map((r) => r.wbs)).toEqual([
      '1.2.3',
      '1.2.1',
    ]);
    expect(expandDepEndpoints('1.1.1,1.1.1').map((r) => r.wbs)).toEqual([
      '1.1.1',
    ]);

    expect(expandSeamAtomicEdges('нет стрелок')).toEqual([]);
    expect(expandSeamAtomicEdges('1.1 ⇢ 2.2')).toEqual([
      { fromWbs: '1.1', toWbs: '2.2', arrow: 'cross' },
    ]);
    expect(expandSeamAtomicEdges(',,, → 1.1')).toEqual([]);

    const cycleMd = `
## 1. Cycle

| ID | Тип | Название | Связи | Статус |
|---|---|---|---|---|
| 1.1 | Работа | A | 1.2 → | ✅ |
| 1.2 | Работа | B | 1.1 → | ⏳ |
`;
    const cycled = parseAnalystMarkdown(cycleMd);
    expect(cycled.cycles.length).toBeGreaterThan(0);

    const contraMd = `
## 1. Contra

| ID | Тип | Название | Связи | Статус |
|---|---|---|---|---|
| 1.1 | Работа | A | — | ⏳ |
| 1.2 | Работа | B | 1.1 → | ✅ |
`;
    const contra = parseAnalystMarkdown(contraMd);
    expect(contra.statusContradictions.some((s) => s.includes('1.1'))).toBe(
      true,
    );

    const missingPred = `
## 1. Missing

| ID | Тип | Название | Связи | Статус |
|---|---|---|---|---|
| 1.1 | Работа | A | 9.9.9 → | ✅ |
| 1.2 | Этап | S | — | ✅ |
| 1.2.1 | Работа | L | 1.2 → | ✅ |
`;
    const miss = parseAnalystMarkdown(missingPred);
    expect(miss.unresolvedRefs).toContain('9.9.9');
    const stageEdge = miss.edges.find((e) => e.toOwnerWbs === '1.2.1');
    expect(stageEdge?.needsProjection).toBe(true);
    expect(
      projectEdgeToLeaves(
        {
          from: [{ wbs: 'nope', projectHint: null }],
          toOwnerWbs: '1.2.1',
          arrow: 'intra',
          raw: '',
          needsProjection: false,
        },
        miss.rows,
      ).from,
    ).toEqual([]);
    expect(
      projectEdgeToLeaves(
        {
          from: [{ wbs: '1.2.1', projectHint: null }],
          toOwnerWbs: 'ghost',
          arrow: 'intra',
          raw: '',
          needsProjection: false,
        },
        miss.rows,
      ).to,
    ).toEqual([]);
  });
});
