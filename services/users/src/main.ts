import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, UnauthorizedException } from '@nestjs/common';
import {
  EnvironmentVariables,
  NodeEnv,
} from './config/environment/env.validation';
import { HttpExceptionFilter } from '@user/infrastructure/adaptars/primary/http/filters/http-exceptions-filter';
import { addRabbitMQClient } from '@config/message-broker/rabbitmq.config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import AppConfig from '@config/app.config';
import fastifyCookie from '@fastify/cookie';
import 'reflect-metadata';
import { readFileSync } from 'fs';

const isMtlsEnabled = (value: string | undefined) =>
  (value ?? '').toLowerCase() === 'true';

const getMtlsHttpsOptions = () => {
  if (!isMtlsEnabled(process.env.MTLS_ENABLED)) return undefined;

  const keyPath = process.env.MTLS_KEY_PATH;
  const certPath = process.env.MTLS_CERT_PATH;
  const caPath = process.env.MTLS_CA_PATH;

  if (!keyPath || !certPath || !caPath) {
    throw new Error(
      'mTLS enabled but MTLS_KEY_PATH, MTLS_CERT_PATH, or MTLS_CA_PATH is missing.',
    );
  }

  if (
    process.env.NODE_ENV === NodeEnv.Production &&
    !isMtlsEnabled(process.env.MTLS_ENABLED)
  ) {
    throw new UnauthorizedException('mTLS required in production.');
  }

  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
    ca: readFileSync(caPath),
    requestCert: true,
    rejectUnauthorized: true,
  };
};

async function bootstrap() {
  const httpsOptions = getMtlsHttpsOptions();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10485760,
      logger: false,
      https: httpsOptions,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);

  const appLogger = new Logger('API');

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  await app.register(fastifyCookie as any, {
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
