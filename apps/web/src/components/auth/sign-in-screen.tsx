'use client';

import { useState } from 'react';

export function SignInScreen({
  returnTo,
  errorMessage,
}: {
  returnTo: string;
  errorMessage: string | null;
}) {
  const [pending, setPending] = useState(false);

  function onSubmit() {
    // Defer pending UI until after native form serialization.
    queueMicrotask(() => setPending(true));
  }

  return (
    <div
      className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 shadow-[var(--elevation-1)]"
      data-login-card
    >
      <h1 className="text-lg font-semibold tracking-tight text-[var(--text)]">
        Авторизация
      </h1>
      <form
        id="pharma-login-form"
        method="post"
        action="/backend/v1/auth/login"
        className="mt-4 grid gap-4"
        onSubmit={onSubmit}
      >
        <input type="hidden" name="return" value={returnTo} />
        <div className="grid gap-2">
          <label
            htmlFor="username"
            className="text-sm text-[var(--text-muted)]"
          >
            Логин
          </label>
          <input
            id="username"
            name="username"
            className="login-field h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)]"
            autoComplete="username"
            required
            readOnly={pending}
          />
        </div>
        <div className="grid gap-2">
          <label
            htmlFor="password"
            className="text-sm text-[var(--text-muted)]"
          >
            Пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="login-field h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text)]"
            autoComplete="current-password"
            required
            readOnly={pending}
          />
        </div>
        {errorMessage ? (
          <p role="alert" className="text-sm text-[var(--status-danger-fg)]">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            value="1"
            defaultChecked={false}
            className="login-remember size-4 shrink-0 rounded-sm border border-[var(--border)] bg-[var(--surface-raised)] accent-[var(--login-accent-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--login-accent-ring)]"
          />
          <label
            htmlFor="remember"
            className="text-sm font-normal text-[var(--text-muted)]"
          >
            Запомнить меня
          </label>
        </div>
        <button
          type="submit"
          className="min-w-24 w-fit justify-self-start rounded-[var(--radius-sm)] bg-[var(--login-accent)] px-4 py-2 text-sm font-medium text-[var(--login-accent-foreground)] outline-none hover:bg-[var(--login-accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--login-accent-ring)] disabled:opacity-60"
          disabled={pending}
        >
          {pending ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
