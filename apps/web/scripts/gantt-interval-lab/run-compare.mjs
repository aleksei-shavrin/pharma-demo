/**
 * Headless run of the comparison lab. Serves apps/web and injects baseline-overlay.ts.
 * Not a product route.
 */
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const labDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(labDir, '../..');
const repoRoot = path.resolve(webRoot, '../..');
const webRequire = createRequire(path.join(webRoot, 'package.json'));
const rootRequire = createRequire(path.join(repoRoot, 'package.json'));
const ts = webRequire('typescript');
const { chromium } = rootRequire('playwright');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
};

function overlayInitScript(source) {
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: 'baseline-overlay.ts',
  }).outputText;
  return `const exports = {}; const module = { exports };\n${compiled}\nwindow.BaselineOverlay = module.exports;`;
}

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      const relative = decodeURIComponent(url.pathname);
      const filePath = path.normalize(path.join(webRoot, relative));
      if (!filePath.startsWith(webRoot)) {
        res.writeHead(403);
        res.end('forbidden');
        return;
      }
      const body = await readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const source = await readFile(
  path.join(webRoot, 'src/components/schedule/baseline-overlay.ts'),
  'utf8',
);
const server = await startServer();
const { port } = server.address();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(overlayInitScript(source));
  await page.goto(`http://127.0.0.1:${port}/scripts/gantt-interval-lab/compare.html`, {
    waitUntil: 'networkidle',
  });
  await page.waitForFunction(() => {
    const text = document.getElementById('report')?.textContent ?? '';
    return text && text !== 'запуск…';
  });
  const report = await page.locator('#report').innerText();
  const shotDir = '/tmp/pharma-demo-artifacts/baseline-over-forecast';
  await mkdir(shotDir, { recursive: true });
  await page.locator('#gantt').screenshot({ path: `${shotDir}/compare-gantt.png` });
  console.log(report);
} finally {
  await browser.close();
  server.close();
}
