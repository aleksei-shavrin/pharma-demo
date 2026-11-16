/**
 * r6 browser acceptance — reads local gitignored auth files from repo root.
 * Do not print secret values.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT =
  '/tmp/pharma-demo-artifacts/pharma-dashboard-pages-consistency-1c199ddd';
const AUTH_ENV = path.join(ROOT, '.env.dev-auth');
const AUTH_PASS = path.join(ROOT, '.dev-login-password');
const BASE = 'http://localhost:3080';

fs.mkdirSync(OUT, { recursive: true });

function readUser() {
  const raw = fs.readFileSync(AUTH_ENV, 'utf8');
  const preferred = [
    'LOGIN_USERNAME',
    'DEV_AUTH_USER',
    'DEMO_USER',
    'AUTH_USER',
  ];
  const map = new Map();
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    const val = t
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    map.set(key, val);
  }
  for (const key of preferred) {
    if (map.get(key)) return map.get(key);
  }
  for (const [key, val] of map) {
    if (/(USER|USERNAME|LOGIN)$/i.test(key) && val) return val;
  }
  throw new Error(`no user key in ${AUTH_ENV}`);
}

async function login(page, user, pass) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('input[type="password"]').waitFor({ timeout: 15000 });
  const userInput = page.locator(
    'input[name="username"], input[autocomplete="username"], input[type="text"], input:not([type])',
  ).first();
  await userInput.fill(user);
  await page.locator('input[type="password"]').fill(pass);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 25000,
  });
}

/** URL ?snapshot= is not the session owner — switch via AppBar selector. */
async function selectSnapshot(page, snap) {
  const trigger = page.locator('[data-snapshot-trigger]').first();
  await trigger.click({ timeout: 10000 });
  const list = page.locator('[data-snapshot-listbox]');
  await list.waitFor({ timeout: 10000 });
  const opt = list.getByRole('option', { name: new RegExp(`^${snap}\\s`) });
  await opt.first().click({ timeout: 10000 });
  await page.waitForTimeout(1200);
  await page.waitForFunction(
    (s) => {
      const t = document.querySelector('[data-snapshot-trigger]')?.textContent ?? '';
      return new RegExp(`Снимок\\s*${s}\\b`).test(t) || t.trim().startsWith(s);
    },
    snap,
    { timeout: 20000 },
  ).catch(() => null);
}

async function measureTimeline(page) {
  return page.evaluate(() => {
    const track = document.querySelector('[data-timeline-track]');
    const rows = [
      ...document.querySelectorAll('[data-timeline-program-row]'),
    ];
    let overlaps = 0;
    let markerCount = 0;
    for (const row of rows) {
      const markers = [...row.querySelectorAll('[data-milestone-marker]')];
      markerCount += markers.length;
      const boxes = markers.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      });
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          const hit =
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y;
          if (hit) overlaps += 1;
        }
      }
    }
    // MS-PS lives outside program rows
    markerCount += document.querySelectorAll(
      '[data-milestone-marker="MS-PS"], [data-ps-cluster]',
    ).length
      ? 1
      : 0;
    const allMarkers = document.querySelectorAll('[data-milestone-marker]').length;
    const scope = document.querySelector('[data-timeline-scope-filter]');
    const program = document.querySelector('[data-timeline-program-filter]');
    const programOpts = program
      ? [...program.querySelectorAll('option')].map((o) => o.textContent?.trim())
      : [];
    return {
      layout: track?.getAttribute('data-timeline-layout'),
      countAttr: track?.getAttribute('data-timeline-count'),
      markerCount: allMarkers,
      rowMarkerCount: markerCount,
      overlaps,
      scopeLabel: scope?.selectedOptions?.[0]?.textContent?.trim() ?? null,
      programOptsSample: programOpts.slice(0, 4),
      hasPrgCodesOnly: programOpts.every(
        (t) => !t || t === 'Все программы' || /^PRG-/.test(t),
      ),
    };
  });
}

async function countRows(page) {
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return 0;
    return [...tbody.querySelectorAll('tr')].filter(
      (tr) => !tr.querySelector('[data-register-filtered-empty]'),
    ).length;
  });
}

const report = {
  ok: false,
  at: new Date().toISOString(),
  snaps: {},
  filters: {},
  timeline: {},
  loading: {},
  errors: [],
};

try {
  const user = readUser();
  const pass = fs.readFileSync(AUTH_PASS, 'utf8').trim();
  if (!user || !pass) throw new Error('empty auth credentials');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await login(page, user, pass);

    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForSelector('[data-timeline-track]', { timeout: 20000 });
    for (const snap of ['A', 'C', 'S']) {
      await selectSnapshot(page, snap);
      await page.waitForSelector('[data-timeline-track]', { timeout: 20000 });
      const tl = await measureTimeline(page);
      report.snaps[snap] = {
        url: page.url(),
        timeline: tl,
        chip: await page.locator('[data-snapshot-trigger]').first().textContent(),
      };
      await page.screenshot({
        path: path.join(OUT, `r6-dashboard-${snap}-1440.png`),
      });
    }

    await page.setViewportSize({ width: 1920, height: 1080 });
    await selectSnapshot(page, 'C');
    await page.waitForSelector('[data-timeline-track]');
    report.timeline['1920'] = await measureTimeline(page);
    await page.screenshot({
      path: path.join(OUT, 'r6-dashboard-C-1920.png'),
    });

    // Overview filter is named as filter
    await page.selectOption('[data-timeline-scope-filter]', 'overview');
    await page.waitForTimeout(400);
    report.timeline.overview = await measureTimeline(page);

    // Program / project / people / schedule / registers
    for (const route of [
      '/programs',
      '/programs/PRG-CON',
      '/projects',
      '/projects/AN-08',
      '/people',
      '/schedule',
      '/milestones',
      '/equipment',
      '/issues-risks',
    ]) {
      await page.goto(`${BASE}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await page.waitForTimeout(1200);
      const slug = route.replace(/\W+/g, '_').replace(/^_|_$/g, '');
      await page.screenshot({
        path: path.join(OUT, `r6-route-${slug}.png`),
        fullPage: route.includes('PRG-CON') || route.includes('AN-08'),
      });
    }

    // Filter deep-links vs dashboard cards
    await page.goto(`${BASE}/?snapshot=C`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const dashCounts = await page.evaluate(() => {
      const text = document.body.innerText;
      const pick = (re) => {
        const m = text.match(re);
        return m ? Number(m[1]) : null;
      };
      return {
        bodySample: text.slice(0, 400),
        // best-effort; filled from data attrs if present
        cards: [...document.querySelectorAll('[data-attention-count], [data-dashboard-metric]')].map(
          (el) => ({
            attr: el.getAttribute('data-attention-count') || el.getAttribute('data-dashboard-metric'),
            text: el.textContent?.trim(),
          }),
        ),
      };
    });
    report.filters.dashboard = dashCounts;

    await selectSnapshot(page, 'C');
    await page.goto(`${BASE}/issues-risks?type=Issue&issueStatus=active`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('table tbody tr, [data-page-state]', {
      timeout: 15000,
    }).catch(() => null);
    report.filters.activeIssues = {
      url: page.url(),
      rows: await countRows(page),
      summary: await page.locator('[data-register-summary]').textContent().catch(() => null),
    };
    await page.screenshot({
      path: path.join(OUT, 'r6-issues-active-filter.png'),
    });

    await page.goto(`${BASE}/issues-risks?type=Risk&rag=Red`, {
      waitUntil: 'networkidle',
    });
    await page.waitForSelector('table tbody tr, [data-page-state]', {
      timeout: 15000,
    }).catch(() => null);
    report.filters.redRisks = {
      url: page.url(),
      rows: await countRows(page),
      summary: await page.locator('[data-register-summary]').textContent().catch(() => null),
    };

    await page.goto(`${BASE}/equipment?status=Delayed`, {
      waitUntil: 'networkidle',
    });
    await page.waitForSelector('table tbody tr, [data-page-state]', {
      timeout: 15000,
    }).catch(() => null);
    report.filters.delayedEq = {
      url: page.url(),
      rows: await countRows(page),
      summary: await page.locator('[data-register-summary]').textContent().catch(() => null),
    };

    // history: back/forward should keep filter
    await page.goBack();
    await page.waitForTimeout(500);
    report.filters.afterBack = page.url();
    await page.goForward();
    await page.waitForTimeout(500);
    report.filters.afterForward = page.url();

    // loading skeleton probe (route with network stall)
    await page.route('**/v1/**/programs**', async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });
    await page.route('**/backend/v1/**/programs**', async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });
    const loadNav = page.goto(`${BASE}/programs?snapshot=C`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(600);
    report.loading.programs = await page.evaluate(() => ({
      busy: !!document.querySelector(
        '[aria-busy="true"], [data-page-state="loading"]',
      ),
      skeleton: !!document.querySelector('.animate-pulse'),
      plainLoadingTextOnly:
        /Загрузка/.test(document.body.innerText) &&
        !document.querySelector('.animate-pulse'),
    }));
    await loadNav;
    await page.unroute('**/v1/**/programs**');
    await page.unroute('**/backend/v1/**/programs**');

    const overlapsOk =
      (report.snaps.C?.timeline?.overlaps ?? 99) === 0 &&
      (report.timeline['1920']?.overlaps ?? 99) === 0;
    report.ok =
      report.snaps.A?.timeline?.markerCount === 189 &&
      report.snaps.C?.timeline?.layout === 'r6-program-lanes' &&
      report.timeline.overview?.scopeLabel?.toLowerCase().includes('фильтр') &&
      overlapsOk &&
      report.filters.activeIssues?.rows > 0 &&
      (report.loading.programs?.busy === true ||
        report.loading.programs?.skeleton === true);
  } finally {
    await browser.close();
  }
} catch (e) {
  report.errors.push(String(e));
  report.stack = e?.stack;
  fs.writeFileSync(
    path.join(OUT, 'r6-browser-error.json'),
    JSON.stringify({ error: String(e), stack: e?.stack }, null, 2),
  );
}

fs.writeFileSync(
  path.join(OUT, 'r6-browser-acceptance.json'),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      ok: report.ok,
      errors: report.errors,
      snaps: Object.fromEntries(
        Object.entries(report.snaps).map(([k, v]) => [
          k,
          {
            markers: v.timeline?.markerCount,
            overlaps: v.timeline?.overlaps,
            layout: v.timeline?.layout,
          },
        ]),
      ),
      overview: report.timeline.overview?.scopeLabel,
      loading: report.loading.programs,
    },
    null,
    2,
  ),
);
if (!report.ok) process.exitCode = 1;
