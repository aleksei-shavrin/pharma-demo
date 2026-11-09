/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  SEMANTIC_PROGRESS_PCT_COL,
  SemanticProgressBar,
} from './semantic-progress-bar';

describe('SemanticProgressBar', () => {
  afterEach(() => cleanup());

  it('renders empty label when progressPct is null', () => {
    render(
      <SemanticProgressBar progressPct={null} fillTone="ok" emptyLabel="нет данных" />,
    );
    expect(screen.getByText('нет данных')).toBeTruthy();
  });

  it('renders track fill and percent for known progress', () => {
    const { container } = render(
      <SemanticProgressBar progressPct={47} fillTone="danger" />,
    );
    expect(screen.getByText('47%')).toBeTruthy();
    const fill = container.querySelector('[data-semantic-progress-fill="true"]');
    expect(fill?.getAttribute('style')).toContain('width: 47%');
    expect(
      container.querySelector('[data-progress-fill-tone="danger"]'),
    ).toBeTruthy();
  });

  it('clamps 0 and 100 as known values with full percent text and ch-based column', () => {
    const { container, rerender } = render(
      <SemanticProgressBar progressPct={0} fillTone="ok" />,
    );
    expect(screen.getByText('0%')).toBeTruthy();
    rerender(<SemanticProgressBar progressPct={100} fillTone="ok" />);
    const pct = container.querySelector('[data-semantic-progress-pct="true"]');
    expect(pct?.textContent).toBe('100%');
    const meter = container.querySelector('[data-semantic-progress="known"]');
    expect(meter).toHaveAttribute(
      'data-semantic-progress-pct-col',
      SEMANTIC_PROGRESS_PCT_COL,
    );
    expect(meter?.getAttribute('style') ?? '').toContain(SEMANTIC_PROGRESS_PCT_COL);
    // Column must be ch-based (font metrics), not a fixed rem that clips at text-base.
    expect(SEMANTIC_PROGRESS_PCT_COL).toMatch(/ch$/);
    expect(parseFloat(SEMANTIC_PROGRESS_PCT_COL)).toBeGreaterThanOrEqual(4.5);
  });

  it('compact density uses text-xs and keeps 100% label intact', () => {
    const { container } = render(
      <SemanticProgressBar progressPct={100} fillTone="ok" compact />,
    );
    const meter = container.querySelector('[data-semantic-progress="known"]');
    expect(meter).toHaveAttribute('data-semantic-progress-compact', 'true');
    expect(meter?.className).toMatch(/text-xs/);
    expect(
      container.querySelector('[data-semantic-progress-pct="true"]')?.textContent,
    ).toBe('100%');
  });
});
