/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { addRedisClient } from './config/message-broker/redis.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Auth System')
    .setDescription('The auth system for a e-commerce library')
    .setVersion('1.0')
    .addTag('auth')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  const configService = app.get<ConfigService>(ConfigService);

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  await app.listen(PORT, () =>
    new Logger('Server').debug(`Server running in ${HOST}:${PORT}`),
  );

  await addRedisClient(app, configService);
}

bootstrap();
