/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PageContent, PageFrame, PageHeader } from './page-frame';

afterEach(() => cleanup());

describe('PageFrame scroll contract (R2-W1-R2)', () => {
  it('normal page mode: header outside scroll owner; content is overflow-y-auto', () => {
    render(
      <PageFrame data-page="fixture">
        <PageHeader>
          <h1>Заголовок</h1>
        </PageHeader>
        <PageContent mode="page">
          <p>контент</p>
        </PageContent>
      </PageFrame>,
    );

    const frame = document.querySelector('[data-page-frame="true"]')!;
    const header = document.querySelector('[data-page-header="true"]')!;
    const content = document.querySelector('[data-page-content="true"]')!;

    expect(frame.className).toMatch(/min-h-0/);
    expect(frame.className).toMatch(/overflow-hidden/);
    expect(frame.contains(header)).toBe(true);
    expect(frame.contains(content)).toBe(true);
    expect(content.contains(header)).toBe(false);

    expect(header.className).toMatch(/shrink-0/);
    expect(content.getAttribute('data-page-scroll-mode')).toBe('page');
    expect(content.className).toMatch(/overflow-y-auto/);
    expect(content.className).toMatch(/min-h-0/);
    expect(content.className).not.toMatch(/overflow-hidden(?!-)/);
    expect(screen.getByRole('heading', { name: 'Заголовок' })).toBeInTheDocument();
  });

  it('workspace mode: content is overflow-hidden (not page scroll owner)', () => {
    render(
      <PageFrame>
        <PageHeader>
          <h1>График</h1>
        </PageHeader>
        <PageContent mode="workspace">
          <div data-inner-scroll="true" className="min-h-0 flex-1 overflow-auto">
            rows
          </div>
        </PageContent>
      </PageFrame>,
    );

    const content = document.querySelector('[data-page-content="true"]')!;
    expect(content.getAttribute('data-page-scroll-mode')).toBe('workspace');
    expect(content.className).toMatch(/overflow-hidden/);
    expect(content.className).not.toMatch(/overflow-y-auto/);
    expect(content.className).toMatch(/min-h-0/);
    expect(content.className).toMatch(/flex-1/);
  });
});
