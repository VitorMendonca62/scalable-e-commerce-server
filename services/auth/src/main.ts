import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EnvironmentVariables } from './config/environment/env.validation';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import AppConfig from '@config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appLogger = new Logger('API');

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  app.use(cookieParser());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const appConfig = new AppConfig(configService, app);

  appConfig.configSwagger();
  appConfig.configValidationPipe();
  appConfig.configCors();

  await app
    .listen(PORT, () => appLogger.debug(`Server running in ${HOST}:${PORT}`))
    .catch((err) => appLogger.error(err));
}

bootstrap();
