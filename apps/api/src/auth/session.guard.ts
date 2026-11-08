import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

const PUBLIC_EXACT = new Set([
  '/health',
  '/api',
  '/api-json',
  '/v1/auth/login',
  '/v1/auth/logout',
  '/v1/auth/session',
]);

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const path = normalizePath(req.path || req.url || '');

    if (isPublicPath(path, req.method)) {
      return true;
    }

    // Only gate narrative API; leave swagger assets under /api alone.
    if (!path.startsWith('/v1/')) {
      return true;
    }

    const session = this.auth.sessionFromCookie(req.headers.cookie);
    if (session == null) {
      const res = context.switchToHttp().getResponse<{
        setHeader?: (name: string, value: string) => void;
      }>();
      res.setHeader?.('Cache-Control', 'private, no-store');
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
    return true;
  }
}

function normalizePath(raw: string): string {
  const withoutQuery = raw.split('?')[0] ?? '';
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery || '/';
}

function isPublicPath(path: string, method: string): boolean {
  if (PUBLIC_EXACT.has(path)) {
    return true;
  }
  // Swagger UI static under /api/*
  if (path === '/api' || path.startsWith('/api/')) {
    return true;
  }
  // Allow OPTIONS for CORS preflight without session.
  if (method.toUpperCase() === 'OPTIONS') {
    return true;
  }
  return false;
}
