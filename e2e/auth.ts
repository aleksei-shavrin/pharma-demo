import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from '@playwright/test';

/** Demo credentials from gitignored DX files — never hardcode secrets. */
export function readDemoLogin(): { username: string; password: string } {
  const root = resolve(__dirname, '..');
  const authEnv = readFileSync(resolve(root, '.env.dev-auth'), 'utf8');
  const usernameMatch = authEnv.match(/^LOGIN_USERNAME=(.*)$/m);
  const username = usernameMatch?.[1]?.trim();
  const password = readFileSync(resolve(root, '.dev-login-password'), 'utf8')
    .trim();
  if (!username || !password) {
    throw new Error(
      'Missing .env.dev-auth / .dev-login-password — run npm run dev:auth:ensure',
    );
  }
  return { username, password };
}

export async function loginViaForm(page: Page, returnPath = '/'): Promise<void> {
  const { username, password } = readDemoLogin();
  await page.goto(`/login?return=${encodeURIComponent(returnPath)}`);
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 20_000,
  });
}
