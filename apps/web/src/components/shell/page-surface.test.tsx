/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PageSurface } from './page-surface';

afterEach(cleanup);

describe('PageSurface', () => {
  it('пластина берёт surface-raised, как карточки дашборда', () => {
    render(
      <PageSurface>
        <span>Содержание</span>
      </PageSurface>,
    );

    const plate = document.querySelector('[data-page-surface="true"] > div');
    expect(plate?.className).toContain('bg-[var(--surface-raised)]');
    expect(plate?.className).not.toContain('bg-[var(--surface)]');
  });
});
