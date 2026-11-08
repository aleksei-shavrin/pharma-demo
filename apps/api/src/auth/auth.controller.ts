import { Controller, Get, Post, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RATE_LIMIT_MESSAGE } from './login-decision';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    setNoStore(res);
    const decision = await this.auth.login({
      origin: headerString(req.headers.origin),
      realIpHeader: req.headers['x-real-ip'],
      contentType: headerString(req.headers['content-type']),
      body: req.body as Record<string, unknown> | undefined,
    });

    if (decision.status === 403) {
      res.status(HttpStatus.FORBIDDEN).json({ message: 'Forbidden' });
      return;
    }
    if (decision.status === 429) {
      res
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .json({ message: RATE_LIMIT_MESSAGE });
      return;
    }

    if (decision.setCookie) {
      res.setHeader('Set-Cookie', decision.setCookie);
    }
    res.redirect(HttpStatus.SEE_OTHER, decision.location);
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response): void {
    setNoStore(res);
    const decision = this.auth.logout({
      method: req.method,
      origin: headerString(req.headers.origin),
    });

    if (decision.status === 405) {
      res
        .status(HttpStatus.METHOD_NOT_ALLOWED)
        .json({ message: 'Method Not Allowed' });
      return;
    }
    if (decision.status === 403) {
      res.status(HttpStatus.FORBIDDEN).json({ message: 'Forbidden' });
      return;
    }

    res.setHeader('Set-Cookie', decision.clearCookie);
    res.redirect(HttpStatus.SEE_OTHER, decision.location);
  }

  @Get('session')
  session(@Req() req: Request, @Res() res: Response): void {
    setNoStore(res);
    const payload = this.auth.sessionFromCookie(req.headers.cookie);
    if (payload == null) {
      res.status(HttpStatus.UNAUTHORIZED).end();
      return;
    }
    res.status(HttpStatus.NO_CONTENT).end();
  }
}

function setNoStore(res: Response): void {
  res.setHeader('Cache-Control', 'private, no-store');
}

function headerString(value: string | string[] | undefined): string | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
