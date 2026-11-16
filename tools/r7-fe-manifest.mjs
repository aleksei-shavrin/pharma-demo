/**
 * r7: run every FE vitest file in its own process (maxWorkers=1).
 * Writes JSON manifest filepath → exit/tests. No AI.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/web');
const OUT =
  '/tmp/pharma-demo-artifacts/pharma-dashboard-pages-consistency-1c199ddd';
const LIST = path.join(OUT, 'r7-fe-filelist.txt');
const MANIFEST = path.join(OUT, 'r7-fe-manifest.json');
const LOG = path.join(OUT, 'r7-fe-manifest.log');

fs.mkdirSync(OUT, { recursive: true });

const files = fs
  .readFileSync(LIST, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const results = [];
let failed = 0;
let missing = 0;
let totalTests = 0;
const logFd = fs.openSync(LOG, 'w');

function rel(abs) {
  return path.relative(ROOT, abs).replace(/\\/g, '/');
}

for (let i = 0; i < files.length; i++) {
  const abs = files[i];
  const file = rel(abs);
  if (!fs.existsSync(abs)) {
    missing += 1;
    results.push({ file, abs, exit: null, tests: 0, missing: true });
    fs.writeSync(logFd, `[${i + 1}/${files.length}] MISSING ${file}\n`);
    continue;
  }
  const jsonOut = path.join(OUT, `r7-vitest-${i}.json`);
  const r = spawnSync(
    'npx',
    [
      'vitest',
      'run',
      file,
      '--maxWorkers=1',
      '--fileParallelism=false',
      '--reporter=json',
      `--outputFile=${jsonOut}`,
    ],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
      encoding: 'utf8',
      timeout: 180000,
    },
  );
  let tests = 0;
  let failedTests = 0;
  let oom = /heap out of memory|FATAL ERROR/i.test(
    `${r.stdout ?? ''}\n${r.stderr ?? ''}`,
  );
  if (fs.existsSync(jsonOut)) {
    try {
      const j = JSON.parse(fs.readFileSync(jsonOut, 'utf8'));
      tests = j.numTotalTests ?? j.testResults?.reduce(
        (a, t) => a + (t.assertionResults?.length ?? 0),
        0,
      ) ?? 0;
      failedTests = j.numFailedTests ?? 0;
    } catch {
      /* keep zeros */
    }
    try {
      fs.unlinkSync(jsonOut);
    } catch {
      /* ignore */
    }
  }
  if (r.status !== 0) failed += 1;
  totalTests += tests;
  const row = {
    file,
    exit: r.status,
    tests,
    failedTests,
    oom,
    signal: r.signal ?? null,
  };
  results.push(row);
  fs.writeSync(
    logFd,
    `[${i + 1}/${files.length}] exit=${r.status} tests=${tests} failed=${failedTests}${oom ? ' OOM' : ''} ${file}\n`,
  );
  if ((i + 1) % 10 === 0) {
    process.stdout.write(
      `progress ${i + 1}/${files.length} failed=${failed} tests=${totalTests}\n`,
    );
  }
}

fs.closeSync(logFd);

const summary = {
  at: new Date().toISOString(),
  totalFilesListed: files.length,
  filesRun: results.filter((r) => !r.missing).length,
  missing,
  failed,
  oomFiles: results.filter((r) => r.oom).map((r) => r.file),
  totalTests,
  ok: missing === 0 && failed === 0,
  results,
};
fs.writeFileSync(MANIFEST, JSON.stringify(summary, null, 2));
process.stdout.write(
  JSON.stringify(
    {
      ok: summary.ok,
      totalFilesListed: summary.totalFilesListed,
      missing,
      failed,
      totalTests,
      oomFiles: summary.oomFiles,
    },
    null,
    2,
  ) + '\n',
);
process.exit(summary.ok ? 0 : 1);
