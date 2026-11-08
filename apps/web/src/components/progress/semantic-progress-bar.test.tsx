/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SemanticProgressBar } from './semantic-progress-bar';

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

  it('clamps 0 and 100 as known values', () => {
    const { rerender } = render(
      <SemanticProgressBar progressPct={0} fillTone="ok" />,
    );
    expect(screen.getByText('0%')).toBeTruthy();
    rerender(<SemanticProgressBar progressPct={100} fillTone="ok" />);
    expect(screen.getByText('100%')).toBeTruthy();
  });
});
