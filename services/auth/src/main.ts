import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EnvironmentVariables } from './config/environment/env.validation';
import AppConfig from '@config/app.config';
import { HttpExceptionFilter } from '@auth/infrastructure/adaptars/primary/http/filters/http-exceptions-filter';
import { addRabbitMQClient } from '@config/message-broker/rabbitmq.config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10485760,
      logger: false,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const appLogger = new Logger('API');

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  await app.register(fastifyCookie, {
    secret: configService.get<string>('COOKIE_SECRET'),
  });

  const appConfig = new AppConfig(configService, app);

  addRabbitMQClient(app, configService);
  appConfig.configSwagger();
  appConfig.configValidationPipe();
  appConfig.configCors();

  await app
    .listen(PORT, () => appLogger.debug(`Server running in ${HOST}:${PORT}`))
    .catch((err) => appLogger.error(err));
}

bootstrap();
