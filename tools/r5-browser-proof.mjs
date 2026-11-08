import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = '/tmp/pharma-demo-artifacts/pharma-dashboard-pages-consistency-1c199ddd';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const base = 'http://localhost:3080';
try {
  const envAuth = fs.readFileSync('.env.dev-auth', 'utf8');
  const userLine = envAuth.split('\n').find((l) => l && !l.startsWith('#') && l.includes('='));
  const user = userLine.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  const pass = fs.readFileSync('apps/web/.dev-login-password', 'utf8').trim();
  await page.goto(base + '/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="password"]').waitFor({ timeout: 10000 });
  const inputs = page.locator('input');
  const count = await inputs.count();
  // fill first text-like then password
  for (let i = 0; i < count; i++) {
    const t = await inputs.nth(i).getAttribute('type');
    if (t === 'password') await inputs.nth(i).fill(pass);
    else if (t !== 'hidden' && t !== 'submit') await inputs.nth(i).fill(user);
  }
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2500);
  for (const snap of ['A', 'C', 'S']) {
    await page.goto(`${base}/?snapshot=${snap}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${out}/r5-dashboard-${snap}-1440.png` });
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${base}/?snapshot=C`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/r5-dashboard-C-1920.png` });
  await page.goto(`${base}/programs/PRG-CON`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/r5-program-PRG-CON.png`, fullPage: true });
  await page.goto(`${base}/projects`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/r5-projects-list.png` });
  await page.goto(`${base}/issues-risks?type=Issue&issueStatus=active`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/r5-issues-active-filter.png` });
  fs.writeFileSync(`${out}/r5-browser-ok.json`, JSON.stringify({ ok: true, at: new Date().toISOString() }, null, 2));
  console.log('browser proofs ok');
} catch (e) {
  fs.writeFileSync(`${out}/r5-browser-error.json`, JSON.stringify({ error: String(e), stack: e.stack }, null, 2));
  console.error(e);
  process.exitCode = 1;
} finally {
  await browser.close();
}
