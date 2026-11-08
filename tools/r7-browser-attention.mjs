/**
 * r7: click real dashboard attention cards; verify hrefs/counts vs registers.
 * Auth absolute paths authorized for local demo proofs. Do not print secrets.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = '/home/aleksei/pharma-demo';
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
  const userInput = page
    .locator(
      'input[name="username"], input[autocomplete="username"], input[type="text"], input:not([type])',
    )
    .first();
  await userInput.fill(user);
  await page.locator('input[type="password"]').fill(pass);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 25000,
  });
}

async function selectSnapshot(page, snap) {
  const trigger = page.locator('[data-snapshot-trigger]').first();
  await trigger.click({ timeout: 10000 });
  const list = page.locator('[data-snapshot-listbox]');
  await list.waitFor({ timeout: 10000 });
  const opt = list.getByRole('option', { name: new RegExp(`^${snap}\\s`) });
  await opt.first().click({ timeout: 10000 });
  await page.waitForTimeout(1200);
  await page
    .waitForFunction(
      (s) => {
        const t =
          document.querySelector('[data-snapshot-trigger]')?.textContent ?? '';
        return new RegExp(`Снимок\\s*${s}\\b`).test(t) || t.trim().startsWith(s);
      },
      snap,
      { timeout: 20000 },
    )
    .catch(() => null);
}

async function countRows(page) {
  await page.waitForTimeout(600);
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
  snap: 'C',
  cards: {},
  clicks: {},
  alignment: {},
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
    await selectSnapshot(page, 'C');
    await page.waitForSelector('[data-dashboard-block="management-attention"]', {
      timeout: 20000,
    });

    const cards = await page.evaluate(() => {
      const out = {};
      for (const id of ['issues', 'risks', 'equipment', 'milestones']) {
        const el = document.querySelector(`[data-attention="${id}"]`);
        if (!el) {
          out[id] = null;
          continue;
        }
        const a = el.closest('a') || el.querySelector('a') || el;
        out[id] = {
          count: Number(el.getAttribute('data-attention-count')),
          href: a.getAttribute('href'),
          text: el.textContent?.trim()?.slice(0, 120) ?? null,
        };
      }
      return out;
    });
    report.cards = cards;

    const expected = {
      issues: '/issues-risks?type=Issue&issueStatus=active',
      risks: '/issues-risks?type=Risk&rag=Red',
      equipment: '/equipment?critical=1&status=Delayed',
      milestones: '/milestones?rag=Red',
    };

    for (const id of Object.keys(expected)) {
      const card = cards[id];
      if (!card?.href) {
        report.errors.push(`missing card ${id}`);
        continue;
      }
      if (card.href !== expected[id]) {
        report.errors.push(
          `href mismatch ${id}: got ${card.href} expected ${expected[id]}`,
        );
      }

      // Actual click from dashboard (not goto of simplified URL)
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
      await selectSnapshot(page, 'C');
      await page.waitForSelector(`[data-attention="${id}"]`, { timeout: 15000 });
      const beforeUrl = page.url();
      const link = page.locator(`[data-attention="${id}"] a`).first();
      await link.click();
      await page.waitForURL(
        (url) =>
          url.pathname !== '/' ||
          url.search.includes('type=') ||
          url.search.includes('rag=') ||
          url.search.includes('critical=') ||
          url.search.includes('status='),
        { timeout: 20000 },
      ).catch(() => null);
      await page.waitForTimeout(1000);
      await page
        .waitForSelector('table tbody tr, [data-page-state], [data-register-summary]', {
          timeout: 15000,
        })
        .catch(() => null);

      const afterUrl = page.url();
      const rows = await countRows(page);
      const summary = await page
        .locator('[data-register-summary]')
        .textContent()
        .catch(() => null);

      // back then direct URL
      await page.goBack();
      await page.waitForTimeout(600);
      const afterBack = page.url();
      await page.goto(`${BASE}${expected[id]}`, { waitUntil: 'networkidle' });
      await selectSnapshot(page, 'C').catch(() => null);
      await page.waitForTimeout(800);
      const directRows = await countRows(page);
      const directUrl = page.url();

      report.clicks[id] = {
        beforeUrl,
        clickHref: card.href,
        afterUrl,
        afterBack,
        directUrl,
        clickRows: rows,
        directRows,
        summary,
        cardCount: card.count,
        countMatchesRows: card.count === rows,
      };

      if (id === 'equipment' && !afterUrl.includes('critical=1')) {
        report.errors.push(`equipment click missing critical=1: ${afterUrl}`);
      }
      if (card.count !== rows) {
        report.errors.push(
          `count≠rows ${id}: card=${card.count} rows=${rows} url=${afterUrl}`,
        );
      }
    }

    report.alignment = {
      equipmentHasCritical: String(cards.equipment?.href ?? '').includes(
        'critical=1',
      ),
      milestonesCatalogOnlyNote:
        'attention count excludes KT-*; register /milestones is catalog',
      issuesOk: report.clicks.issues?.countMatchesRows === true,
      risksOk: report.clicks.risks?.countMatchesRows === true,
      equipmentOk: report.clicks.equipment?.countMatchesRows === true,
      milestonesOk: report.clicks.milestones?.countMatchesRows === true,
    };

    report.ok =
      report.errors.length === 0 &&
      report.alignment.equipmentHasCritical &&
      report.alignment.issuesOk &&
      report.alignment.risksOk &&
      report.alignment.equipmentOk &&
      report.alignment.milestonesOk;
  } finally {
    await browser.close();
  }
} catch (e) {
  report.errors.push(String(e?.stack || e));
  report.ok = false;
}

fs.writeFileSync(
  path.join(OUT, 'r7-browser-attention.json'),
  JSON.stringify(report, null, 2),
);
process.stdout.write(
  JSON.stringify(
    {
      ok: report.ok,
      errors: report.errors,
      cards: report.cards,
      clicks: Object.fromEntries(
        Object.entries(report.clicks).map(([k, v]) => [
          k,
          {
            afterUrl: v.afterUrl,
            cardCount: v.cardCount,
            clickRows: v.clickRows,
            match: v.countMatchesRows,
          },
        ]),
      ),
    },
    null,
    2,
  ) + '\n',
);
process.exit(report.ok ? 0 : 1);
