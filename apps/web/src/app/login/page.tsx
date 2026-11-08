import type { Metadata } from 'next';
import { SignInScreen } from '@/components/auth/sign-in-screen';
import { sanitizeReturnPath } from '@/lib/auth/return-path';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Авторизация',
};

const INVALID_CREDENTIALS_MESSAGE = 'Неверный логин или пароль';
const LOGIN_ERROR_QUERY = '1';

type LoginPageProps = {
  searchParams: Promise<{ return?: string | string[]; error?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawReturn = Array.isArray(params.return) ? params.return[0] : params.return;
  const rawError = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage =
    rawError === LOGIN_ERROR_QUERY ? INVALID_CREDENTIALS_MESSAGE : null;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--canvas)] p-6">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p className="text-center text-lg font-semibold tracking-tight text-[var(--text)]">
          РАНДОК.Платформа
        </p>
        <SignInScreen
          returnTo={sanitizeReturnPath(rawReturn)}
          errorMessage={errorMessage}
        />
      </div>
    </main>
  );
}
