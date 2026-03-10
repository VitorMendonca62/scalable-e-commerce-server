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

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10485760,
      logger: false,
    }),
  );

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
