/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SignInScreen } from './sign-in-screen';

afterEach(() => {
  cleanup();
});

describe('SignInScreen', () => {
  it('renders brand fields, remember unchecked, and posts to Nest login', () => {
    render(
      <SignInScreen returnTo="/schedule?q=1" errorMessage={null} />,
    );
    const form = document.querySelector('#pharma-login-form') as HTMLFormElement;
    expect(form.method).toMatch(/post/i);
    expect(form.getAttribute('action')).toBe('/backend/v1/auth/login');
    expect(
      (document.querySelector('input[name="return"]') as HTMLInputElement).value,
    ).toBe('/schedule?q=1');
    expect(
      (document.querySelector('#remember') as HTMLInputElement).checked,
    ).toBe(false);
    expect(screen.getByRole('button', { name: 'Войти' })).toBeTruthy();
  });

  it('shows error and defers pending without sync-disabling inputs', () => {
    render(
      <SignInScreen returnTo="/" errorMessage="Неверный логин или пароль" />,
    );
    expect(screen.getByRole('alert').textContent).toMatch(/Неверный/);
    const form = document.querySelector('#pharma-login-form') as HTMLFormElement;
    const password = document.querySelector('#password') as HTMLInputElement;
    expect(password.readOnly).toBe(false);
    fireEvent.submit(form);
    // pending flips in microtask — not sync
    expect(password.readOnly).toBe(false);
  });
});
