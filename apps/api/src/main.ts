import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { R2_CONTRACT_EXTRA_MODELS } from './contracts/r2-extra-models';
import { resolveCorsOrigins } from './cors-origins';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('urlencoded', { extended: false, limit: '32kb' });

  // Auth + narrative /v1 must not be publicly cacheable (incl. 401/303).
  app.use((req: Request, res: Response, next: NextFunction) => {
    const path = (req.path || req.url || '').split('?')[0] ?? '';
    if (path === '/v1' || path.startsWith('/v1/')) {
      res.setHeader('Cache-Control', 'private, no-store');
    }
    next();
  });

  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
  });

  const publicApiPrefix = (process.env.PUBLIC_API_PREFIX ?? '').replace(
    /\/+$/,
    '',
  );
  const configBuilder = new DocumentBuilder()
    .setTitle('Pharma Demo API')
    .setDescription(
      'Demo v1 NestJS API — mock data only (no PostgreSQL). R2 contract models registered.',
    )
    .setVersion('0.1.0');
  if (publicApiPrefix) {
    // Try it out / generated server URL must include reverse-proxy prefix (e.g. /backend).
    configBuilder.addServer(publicApiPrefix);
  }
  const config = configBuilder.build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [...R2_CONTRACT_EXTRA_MODELS],
  });
  SwaggerModule.setup('api', app, document, {
    // When UI is opened as /backend/api, fetch OpenAPI via same public prefix.
    swaggerOptions: publicApiPrefix
      ? { url: `${publicApiPrefix}/api-json` }
      : undefined,
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
