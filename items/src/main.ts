/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { addRedisClient } from './config/messaging/redis.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Auth System')
    .setDescription('The book system for a e-commerce library')
    .setVersion('1.0')
    .addTag('items')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  const configService = app.get<ConfigService>(ConfigService);

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<number>('HOST');

  await app.listen(PORT, () =>
    console.warn(`Server running in ${HOST}:${PORT}`),
  );

  if (configService.get('ENVIRONMENT') == 'production') {
    await addRedisClient(app, configService);
  }
}

bootstrap();
