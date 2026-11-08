/**
 * Parser for demo-pharma-greenfield.md (analyst source).
 * certainty: fact for parsed tokens; dates/progress are NOT in source.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const ANALYST_SOURCE_FILE = 'demo-pharma-greenfield.md';
export const ANALYST_SOURCE_SHA256 =
  '9958582606ed60acfc6191f45cea7bb5be745f5021f22d6a21684fa3a3f664ef';

export const ANALYST_EXPECTED = {
  projects: 25,
  stages: 145,
  works: 272,
  checkpoints: 147,
  rows: 564,
  criticalSeams: 7,
} as const;

export type AnalystKind = 'stage' | 'work' | 'checkpoint';

export type AnalystSourceStatus =
  'completed' | 'delayed' | 'missed' | 'in_progress' | 'waiting';

export type AnalystDepArrow = 'intra' | 'cross';

export type AnalystDepRef = {
  wbs: string;
  /** Present when source wrote ⇢P# without a concrete WBS (rare). */
  projectHint: number | null;
};

export type AnalystRawEdge = {
  from: AnalystDepRef[];
  toOwnerWbs: string;
  arrow: AnalystDepArrow;
  raw: string;
  /** True when from/to needed stage→leaf projection later. */
  needsProjection: boolean;
};

export type AnalystRow = {
  projectNo: number;
  wbs: string;
  kind: AnalystKind;
  name: string;
  rawDeps: string;
  statusToken: string;
  sourceStatus: AnalystSourceStatus;
  sourceWeeks: number | null;
};

export type AnalystSeamAtomicEdge = {
  fromWbs: string;
  toWbs: string;
  arrow: 'intra' | 'cross';
};

export type AnalystCriticalSeam = {
  id: string;
  rawDependency: string;
  blocks: string;
  risk: string;
  /** Flattened WBS tokens (order of appearance). */
  endpoints: string[];
  /**
   * Arrow-group expansion: `A → B,C` ⇒ A→B and A→C (fan-out);
   * `A → B → C` ⇒ A→B and B→C (chain). Not endpoints[i]→endpoints[i+1].
   */
  atomicEdges: AnalystSeamAtomicEdge[];
};

export type AnalystParseResult = {
  sha256: string;
  projects: { no: number; name: string }[];
  rows: AnalystRow[];
  edges: AnalystRawEdge[];
  seams: AnalystCriticalSeam[];
  unresolvedRefs: string[];
  cycles: string[][];
  statusContradictions: string[];
};

const ROW_RE =
  /^\| (\d+(?:\.\d+)*) \| (Этап|Работа|КТ) \| (.+?) \| (.+?) \| (.+?) \|$/;
const PROJECT_RE = /^## (\d+)\. (.+)$/;
const WBS_TOKEN_RE = /\d+(?:\.\d+)*/g;

const KIND_MAP: Record<string, AnalystKind> = {
  Этап: 'stage',
  Работа: 'work',
  КТ: 'checkpoint',
};

export function analystSourcePath(root = join(__dirname)): string {
  // Prefer sibling of this module; fall back to src tree when running from dist/.
  const candidates = [
    join(root, ANALYST_SOURCE_FILE),
    join(process.cwd(), 'src/data/fixtures/analyst', ANALYST_SOURCE_FILE),
    join(process.cwd(), 'dist/data/fixtures/analyst', ANALYST_SOURCE_FILE),
    join(
      __dirname,
      '..',
      '..',
      '..',
      'src/data/fixtures/analyst',
      ANALYST_SOURCE_FILE,
    ),
  ];
  for (const candidate of candidates) {
    try {
      readFileSync(candidate, { flag: 'r' });
      return candidate;
    } catch {
      // try next
    }
  }
  return candidates[0];
}

export function readAnalystSource(path = analystSourcePath()): {
  text: string;
  sha256: string;
} {
  const text = readFileSync(path, 'utf8');
  const sha256 = createHash('sha256').update(text, 'utf8').digest('hex');
  return { text, sha256 };
}

export function parseSourceStatus(token: string): {
  sourceStatus: AnalystSourceStatus;
  sourceWeeks: number | null;
} {
  const t = token.trim();
  if (t.includes('✅')) return { sourceStatus: 'completed', sourceWeeks: null };
  if (t.includes('❌')) return { sourceStatus: 'missed', sourceWeeks: null };
  if (t.includes('🔄'))
    return { sourceStatus: 'in_progress', sourceWeeks: null };
  if (t.includes('⏳')) return { sourceStatus: 'waiting', sourceWeeks: null };
  const warn = /⚠(?:️)?\s*(\d+)\s*н/.exec(t);
  if (warn || t.includes('⚠')) {
    return {
      sourceStatus: 'delayed',
      sourceWeeks: warn ? Number(warn[1]) : null,
    };
  }
  return { sourceStatus: 'waiting', sourceWeeks: null };
}

/**
 * Expand dependency cell left of arrow into concrete WBS refs.
 * Supports: single, comma lists, inclusive ranges a.b.c–a.b.d, mixed.
 */
export function expandDepEndpoints(expr: string): AnalystDepRef[] {
  const cleaned = expr
    .replace(/\*\*/g, '')
    .replace(/⇢\s*P?\d*/gi, ' ')
    .replace(/→/g, ' ')
    .trim();
  if (!cleaned || cleaned === '—' || cleaned === '-') return [];

  const refs: AnalystDepRef[] = [];
  const parts = cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  for (const part of parts) {
    const range = /^(\d+(?:\.\d+)*)\s*[–-]\s*(\d+(?:\.\d+)*)$/.exec(part);
    if (range) {
      refs.push(...expandWbsRange(range[1], range[2]));
      continue;
    }
    const tokens = part.match(WBS_TOKEN_RE) ?? [];
    for (const wbs of tokens) {
      refs.push({ wbs, projectHint: null });
    }
  }
  return dedupeRefs(refs);
}

function expandWbsRange(from: string, to: string): AnalystDepRef[] {
  const a = from.split('.').map(Number);
  const b = to.split('.').map(Number);
  if (a.length !== b.length) {
    return [
      { wbs: from, projectHint: null },
      { wbs: to, projectHint: null },
    ];
  }
  const prefix = a.slice(0, -1);
  const start = a[a.length - 1];
  const end = b[b.length - 1];
  if (
    prefix.some((n, i) => n !== b[i]) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end < start
  ) {
    return [
      { wbs: from, projectHint: null },
      { wbs: to, projectHint: null },
    ];
  }
  const out: AnalystDepRef[] = [];
  for (let i = start; i <= end; i += 1) {
    out.push({ wbs: [...prefix, i].join('.'), projectHint: null });
  }
  return out;
}

function dedupeRefs(refs: AnalystDepRef[]): AnalystDepRef[] {
  const seen = new Set<string>();
  const out: AnalystDepRef[] = [];
  for (const ref of refs) {
    if (seen.has(ref.wbs)) continue;
    seen.add(ref.wbs);
    out.push(ref);
  }
  return out;
}

function detectArrow(raw: string): AnalystDepArrow | null {
  if (raw.includes('⇢')) return 'cross';
  if (raw.includes('→')) return 'intra';
  return null;
}

export function parseAnalystMarkdown(
  text: string,
): Omit<AnalystParseResult, 'sha256'> {
  const projects: { no: number; name: string }[] = [];
  const rows: AnalystRow[] = [];
  let currentProject: number | null = null;
  let inSeams = false;
  const seamLines: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (line.includes('критические зависимости') || line.includes('«швов»')) {
      inSeams = true;
      currentProject = null;
      continue;
    }
    const proj = PROJECT_RE.exec(line);
    if (proj) {
      inSeams = false;
      currentProject = Number(proj[1]);
      projects.push({ no: currentProject, name: proj[2].trim() });
      continue;
    }
    if (inSeams) {
      if (
        line.startsWith('|') &&
        !line.includes('Зависимость') &&
        !line.startsWith('|---')
      ) {
        seamLines.push(line);
      }
      continue;
    }
    if (currentProject == null) continue;
    const m = ROW_RE.exec(line);
    if (!m) continue;
    const wbs = m[1];
    const kind = KIND_MAP[m[2]];
    const name = m[3].replace(/\*\*/g, '').trim();
    const rawDeps = m[4].trim();
    const statusToken = m[5].trim();
    const { sourceStatus, sourceWeeks } = parseSourceStatus(statusToken);
    rows.push({
      projectNo: currentProject,
      wbs,
      kind,
      name,
      rawDeps,
      statusToken,
      sourceStatus,
      sourceWeeks,
    });
  }

  const byWbs = new Map(rows.map((r) => [r.wbs, r]));
  const edges: AnalystRawEdge[] = [];
  const unresolved = new Set<string>();

  for (const row of rows) {
    if (!row.rawDeps || row.rawDeps === '—' || row.rawDeps === '-') continue;
    const arrow = detectArrow(row.rawDeps);
    if (!arrow) continue;
    // Split mixed arrows into segments around each arrow glyph.
    const segments = splitMixedDeps(row.rawDeps);
    for (const seg of segments) {
      const from = expandDepEndpoints(seg.left);
      if (from.length === 0) continue;
      let needsProjection = false;
      for (const ref of from) {
        const target = byWbs.get(ref.wbs);
        if (!target) {
          unresolved.add(ref.wbs);
        } else if (target.kind === 'stage') {
          needsProjection = true;
        }
      }
      const owner = byWbs.get(row.wbs);
      if (owner?.kind === 'stage') needsProjection = true;
      edges.push({
        from,
        toOwnerWbs: row.wbs,
        arrow: seg.arrow,
        raw: seg.raw,
        needsProjection,
      });
    }
  }

  const seams = seamLines.map((line, index) => parseSeamLine(line, index));
  for (const seam of seams) {
    for (const ep of seam.endpoints) {
      if (!byWbs.has(ep)) unresolved.add(ep);
    }
  }

  const cycles = findCycles(edges, byWbs);
  const statusContradictions = findStatusContradictions(edges, byWbs);

  return {
    projects,
    rows,
    edges,
    seams,
    unresolvedRefs: [...unresolved].sort(),
    cycles,
    statusContradictions,
  };
}

function splitMixedDeps(
  raw: string,
): { left: string; arrow: AnalystDepArrow; raw: string }[] {
  // e.g. "21.5.2 ⇢,25.5.2 →" or "2.1.3 ⇢, 2.2.3 ⇢"
  const parts: { left: string; arrow: AnalystDepArrow; raw: string }[] = [];
  const re = /([^⇢→]+)(⇢|→)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    parts.push({
      left: m[1].trim().replace(/^,|,$/g, '').trim(),
      arrow: m[2] === '⇢' ? 'cross' : 'intra',
      raw: `${m[1].trim()}${m[2]}`,
    });
  }
  if (parts.length === 0) {
    const arrow = detectArrow(raw);
    if (arrow) {
      parts.push({
        left: raw.replace(/[⇢→]/g, '').trim(),
        arrow,
        raw,
      });
    }
  }
  return parts;
}

function parseSeamLine(line: string, index: number): AnalystCriticalSeam {
  const cells = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean);
  const rawDependency = (cells[0] ?? '').replace(/\*\*/g, '');
  const blocks = cells[1] ?? '';
  const risk = cells[2] ?? '';
  const endpoints = [...rawDependency.matchAll(WBS_TOKEN_RE)].map((m) => m[0]);
  return {
    id: `SEAM-${String(index + 1).padStart(2, '0')}`,
    rawDependency,
    blocks,
    risk,
    endpoints: [...new Set(endpoints)],
    atomicEdges: expandSeamAtomicEdges(rawDependency),
  };
}

/**
 * Split seam dependency by →/⇢ into groups; emit from×to for each consecutive pair of groups.
 */
export function expandSeamAtomicEdges(
  rawDependency: string,
): AnalystSeamAtomicEdge[] {
  const parts: Array<{
    tokens: string[];
    arrowAfter: 'intra' | 'cross' | null;
  }> = [];
  const re = /([^⇢→]+)(⇢|→)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rawDependency)) !== null) {
    const tokens = [...m[1].matchAll(WBS_TOKEN_RE)].map((t) => t[0]);
    if (tokens.length === 0 && !m[2]) continue;
    if (tokens.length === 0) continue;
    const arrowAfter = m[2] === '⇢' ? 'cross' : m[2] === '→' ? 'intra' : null;
    parts.push({ tokens, arrowAfter });
  }
  const atomic: AnalystSeamAtomicEdge[] = [];
  for (let i = 0; i < parts.length - 1; i += 1) {
    const arrow = parts[i].arrowAfter ?? 'intra';
    for (const fromWbs of parts[i].tokens) {
      for (const toWbs of parts[i + 1].tokens) {
        atomic.push({ fromWbs, toWbs, arrow });
      }
    }
  }
  return atomic;
}

function findCycles(
  edges: AnalystRawEdge[],
  byWbs: Map<string, AnalystRow>,
): string[][] {
  const adj = new Map<string, Set<string>>();
  for (const edge of edges) {
    for (const from of edge.from) {
      if (!byWbs.has(from.wbs) || !byWbs.has(edge.toOwnerWbs)) continue;
      if (!adj.has(from.wbs)) adj.set(from.wbs, new Set());
      adj.get(from.wbs)!.add(edge.toOwnerWbs);
    }
  }
  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  function dfs(node: string) {
    if (visiting.has(node)) {
      const i = stack.indexOf(node);
      if (i >= 0) cycles.push(stack.slice(i).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    stack.push(node);
    for (const next of adj.get(node) ?? []) dfs(next);
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of adj.keys()) dfs(node);
  return cycles;
}

function findStatusContradictions(
  edges: AnalystRawEdge[],
  byWbs: Map<string, AnalystRow>,
): string[] {
  const out: string[] = [];
  const complete = new Set(['completed']);
  const incomplete = new Set(['waiting', 'in_progress', 'delayed', 'missed']);
  for (const edge of edges) {
    const to = byWbs.get(edge.toOwnerWbs);
    if (!to || !complete.has(to.sourceStatus)) continue;
    for (const from of edge.from) {
      const pred = byWbs.get(from.wbs);
      if (!pred) continue;
      if (incomplete.has(pred.sourceStatus)) {
        out.push(
          `${pred.wbs}(${pred.sourceStatus}) → ${to.wbs}(${to.sourceStatus})`,
        );
      }
    }
  }
  return out;
}

export function parseAnalystFixture(): AnalystParseResult {
  const { text, sha256 } = readAnalystSource();
  if (sha256 !== ANALYST_SOURCE_SHA256) {
    throw new Error(
      `Analyst source sha256 mismatch: got ${sha256}, expected ${ANALYST_SOURCE_SHA256}`,
    );
  }
  return { sha256, ...parseAnalystMarkdown(text) };
}

/** Project stage refs to leaf works/checkpoints under that stage WBS. */
export function projectEdgeToLeaves(
  edge: AnalystRawEdge,
  rows: readonly AnalystRow[],
): { from: string[]; to: string[] } {
  const leavesUnder = (wbs: string): string[] => {
    const row = rows.find((r) => r.wbs === wbs);
    if (!row) return [];
    if (row.kind !== 'stage') return [wbs];
    const prefix = `${wbs}.`;
    return rows
      .filter(
        (r) =>
          r.wbs.startsWith(prefix) &&
          (r.kind === 'work' || r.kind === 'checkpoint') &&
          !r.wbs.slice(prefix.length).includes('.'),
      )
      .map((r) => r.wbs);
  };
  const from = edge.from.flatMap((r) => leavesUnder(r.wbs));
  const to = leavesUnder(edge.toOwnerWbs);
  return {
    from: [...new Set(from)],
    to: [...new Set(to)],
  };
}
