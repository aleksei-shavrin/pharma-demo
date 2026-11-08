import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Guardrails for middleware source (edge runtime is not executed in Vitest).
 * Live bypass/dot regressions are asserted via /tmp/pharma-form-login/auth-hardening.mjs.
 */
describe('middleware auth allowlist (source)', () => {
  const source = readFileSync(
    resolve(__dirname, './middleware.ts'),
    'utf8',
  );

  it('does not use blanket pathname.includes(".") public bypass', () => {
    expect(source).not.toMatch(/pathname\.includes\(['"]\.['"]\)/);
  });

  it('does not exclude all dotted paths in matcher', () => {
    expect(source).not.toMatch(/\.\*\\\\\.\.\*/);
  });

  it('allowlists login and _next explicitly', () => {
    expect(source).toMatch(/\/login/);
    expect(source).toMatch(/\/_next/);
    expect(source).toMatch(/PRIVATE|no-store/i);
  });
});
