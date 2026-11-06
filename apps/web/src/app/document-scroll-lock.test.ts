import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Document must not be a scroll owner. AppShell is `fixed inset-0` (see
 * app-shell); page/canvas scroll lives in `#main-content` / `PageContent`.
 * Without locking `html`/`body`, the root scroller can still move and show a
 * second scrollbar beside the canvas scroll.
 */
describe('document scroll lock (globals.css)', () => {
  const css = readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), 'globals.css'),
    'utf8',
  );

  it('locks html/body height to the dynamic viewport', () => {
    expect(css).toMatch(
      /html\s*,\s*body\s*\{[^}]*height:\s*100dvh/s,
    );
  });

  it('hides overflow on html/body so the document cannot scroll', () => {
    expect(css).toMatch(
      /html\s*,\s*body\s*\{[^}]*overflow:\s*hidden/s,
    );
  });

  it('does not leave min-height:100% as the sole body size (allows document growth)', () => {
    const bodyBlock = css.match(/html\s*,\s*body\s*\{[^}]*\}/s)?.[0] ?? '';
    expect(bodyBlock).not.toMatch(/min-height:\s*100%/);
  });
});
