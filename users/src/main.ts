/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get<ConfigService>(ConfigService);

  const PORT = configService.get<number>('PORT');
  const HOST = configService.get<number>('PORT');

  await app.listen(PORT, () =>
    console.warn(`Server running in ${HOST}:${PORT}`),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
