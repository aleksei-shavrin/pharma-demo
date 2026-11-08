/** @vitest-environment jsdom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogoutButton } from './logout-button';

afterEach(() => cleanup());

describe('LogoutButton', () => {
  it('posts logout with aria-label and stops click bubble', () => {
    const outer = vi.fn();
    const { container } = render(
      <div onClick={outer}>
        <LogoutButton />
      </div>,
    );
    const form = container.querySelector('[data-logout-control]') as HTMLFormElement;
    expect(form.method).toMatch(/post/i);
    expect(form.getAttribute('action')).toBe('/backend/v1/auth/logout');
    const button = container.querySelector('[data-logout-button]') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Выйти');
    form.addEventListener('submit', (event) => event.preventDefault());
    fireEvent.click(button);
    expect(outer).not.toHaveBeenCalled();
  });
});

