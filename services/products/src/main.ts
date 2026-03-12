import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EnvironmentVariables } from './config/environment/env.validation';
import { HttpExceptionFilter } from '@product/infrastructure/adaptars/primary/http/filters/http-exceptions-filter';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import AppConfig from '@config/app.config';
import multipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10485760,
      logger: false,
    }),
  );

  await app.register(multipart, {
    attachFieldsToBody: 'keyValues',
    limits: {
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      fileSize: 10485760,
      files: 5,
      headerPairs: 2000,
    },
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);

  const appLogger = new Logger('API');

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  const appConfig = new AppConfig(configService, app);

  appConfig.configSwagger();
  appConfig.configValidationPipe();
  appConfig.configCors();

  await app
    .listen(PORT, () => appLogger.debug(`Server running in ${HOST}:${PORT}`))
    .catch((err) => appLogger.error(err));
}

bootstrap();
