/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService>(ConfigService);

  const PORT = configService.get<number>('PORT');
  const HOST = configService.get<number>('HOST');

  await app.listen(PORT, () =>
    console.warn(`Server running in ${HOST}:${PORT}`),
  );

  await app.listen(PORT ?? 3000);
}

bootstrap();
