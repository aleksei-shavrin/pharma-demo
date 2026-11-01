import { defineConfig, devices } from '@playwright/test';

/**
 * Demo v1 narrative E2E (I8).
 *
 * Default: dedicated ports 3120 / 3121 (avoids docs :3000 and common local :3010/:3011).
 * Compose path: `E2E_BASE_URL=http://localhost E2E_SKIP_WEBSERVER=1 npx playwright test`
 */
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3120';
const skipWebServer = process.env.E2E_SKIP_WEBSERVER === '1';
const webPort = process.env.E2E_WEB_PORT ?? '3120';
const apiPort = process.env.E2E_API_PORT ?? '3121';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: skipWebServer
    ? undefined
    : [
        {
          command: 'npm run start:prod',
          cwd: 'apps/api',
          url: `http://127.0.0.1:${apiPort}/health`,
          reuseExistingServer: false,
          timeout: 120_000,
          env: {
            ...process.env,
            PORT: apiPort,
            WEB_ORIGIN: `http://127.0.0.1:${webPort}`,
          },
        },
        {
          command: 'npm run start',
          cwd: 'apps/web',
          url: `http://127.0.0.1:${webPort}`,
          reuseExistingServer: false,
          timeout: 120_000,
          env: {
            ...process.env,
            PORT: webPort,
            NEXT_DIST_DIR: '.next-build',
          },
        },
      ],
});
