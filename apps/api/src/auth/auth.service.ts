import { Injectable, OnModuleInit } from '@nestjs/common';
import { readAuthConfig, type AuthConfig } from './auth-config';
import { evaluateLoginRequest, type LoginDecision } from './login-decision';
import { evaluateLogout, type LogoutDecision } from './logout-decision';
import { sharedLoginFailureLimiter } from './rate-limit';
import { evaluateSessionCookie } from './verify-session';
import type { SessionPayload } from './session-cookie';

@Injectable()
export class AuthService implements OnModuleInit {
  private config: AuthConfig | null = null;
  private readonly rateLimiter = sharedLoginFailureLimiter();

  onModuleInit(): void {
    this.config = readAuthConfig(process.env);
    if (this.config == null) {
      console.error(
        '[auth] Auth config missing or invalid — login/session will fail closed',
      );
    }
  }

  getConfig(): AuthConfig | null {
    return this.config;
  }

  requireConfig(): AuthConfig {
    if (this.config == null) {
      throw new Error('AUTH_CONFIG_UNAVAILABLE');
    }
    return this.config;
  }

  async login(input: {
    origin: string | null | undefined;
    realIpHeader: string | string[] | undefined;
    contentType: string | null | undefined;
    body: Record<string, unknown> | undefined;
    now?: number;
  }): Promise<LoginDecision> {
    const config = this.config;
    if (config == null) {
      return { status: 403 };
    }
    return evaluateLoginRequest({
      ...input,
      body: input.body,
      now: input.now ?? Date.now(),
      config,
      rateLimiter: this.rateLimiter,
    });
  }

  logout(input: {
    method: string;
    origin: string | null | undefined;
  }): LogoutDecision {
    const config = this.config;
    if (config == null) {
      return { status: 403 };
    }
    return evaluateLogout({
      method: input.method,
      origin: input.origin,
      publicOrigin: config.publicOrigin,
      cookieSecure: config.cookieSecure,
    });
  }

  sessionFromCookie(
    cookieHeader: string | null | undefined,
    now = Date.now(),
  ): SessionPayload | null {
    const config = this.config;
    if (config == null) {
      return null;
    }
    return evaluateSessionCookie({
      cookieHeader,
      sessionSecret: config.sessionSecret,
      cookieSecure: config.cookieSecure,
      now,
    });
  }
}
