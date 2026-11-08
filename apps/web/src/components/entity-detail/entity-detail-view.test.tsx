/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  EntityDetailAbsent,
  EntityDetailError,
  EntityDetailLoading,
} from './entity-detail-view';

describe('entity-detail states', () => {
  afterEach(() => cleanup());

  it('loading exposes busy page state', () => {
    render(<EntityDetailLoading />);
    expect(document.querySelector('[data-page-state="loading"]')).toBeTruthy();
  });

  it('absent marks data-page-state and CTA', () => {
    render(
      <EntityDetailAbsent
        entityType="person"
        entityId="PERSON-NOPE"
        snapshot="C"
      />,
    );
    expect(document.querySelector('[data-page-state="absent"]')).toBeTruthy();
    expect(screen.getByText(/Участник отсутствует в снимке C/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'К участникам' })).toHaveAttribute(
      'href',
      '/people',
    );
  });

  it('error retries', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<EntityDetailError message="сеть" onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
