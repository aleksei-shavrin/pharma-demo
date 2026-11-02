import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { R2_CONTRACT_EXTRA_MODELS } from './contracts/r2-extra-models';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: [
      webOrigin,
      'http://localhost',
      'http://localhost:3000',
      'http://localhost:3010',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3010',
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('Pharma Project Control API')
    .setDescription(
      'Demo v1 NestJS API — R2 contract models (Workstream/Person/Cost/Notification) registered ahead of handlers',
    )
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [...R2_CONTRACT_EXTRA_MODELS],
  });
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
