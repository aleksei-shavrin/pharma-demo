/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  PageListEmpty,
  PageListError,
  PageListLoading,
} from './page-list-states';

describe('page-list-states', () => {
  it('loading skeleton exposes label and busy status', () => {
    render(<PageListLoading label="Загрузка программ" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'data-page-state',
      'loading',
    );
    expect(screen.getByText('Загрузка программ')).toBeInTheDocument();
  });

  it('error state retries via button', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<PageListError message="Сбой" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveAttribute(
      'data-page-state',
      'error',
    );
    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('empty state shows message', () => {
    render(<PageListEmpty message="Нет программ" />);
    expect(screen.getByText('Нет программ')).toHaveAttribute(
      'data-page-state',
      'empty',
    );
  });
});
