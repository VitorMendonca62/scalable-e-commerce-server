import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { FieldInvalid } from '@auth/domain/ports/primary/http/errors.port';
import {
  EnvironmentVariables,
  NodeEnv,
} from './config/environment/env.validation';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { Cookies } from '@auth/domain/enums/cookies.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appLogger = new Logger('API');

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  // TODO: Configurar os hosts dps
  app.enableCors({
    origin:
      configService.get('NODE_ENV') === NodeEnv.Production
        ? `http://localhost:${PORT}`
        : [`http://localhost:${PORT}`],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Auth System')
    .setDescription('The auth system for a e-commerce store')
    .setVersion('1.0')
    .addCookieAuth(
      Cookies.RefreshToken,
      {
        type: 'apiKey',
        in: 'cookie',
        name: Cookies.RefreshToken,
      },
      'cookie_refresh',
    )
    .addCookieAuth(
      Cookies.AccessToken,
      {
        type: 'apiKey',
        in: 'cookie',
        name: Cookies.AccessToken,
      },
      'cookie_access',
    )
    .addCookieAuth(
      Cookies.ResetPassToken,
      {
        type: 'apiKey',
        in: 'cookie',
        name: Cookies.ResetPassToken,
      },
      'cookie_reset_pass',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (configService.get('NODE_ENV') !== NodeEnv.Production) {
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        requestInterceptor: (req) => {
          req.credentials = 'include';
          return req;
        },
      },
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transform: false,
      exceptionFactory: (errors) => {
        if (errors.length == 0) {
          return new FieldInvalid('Unknown error', 'Error');
        }

        const firstError = errors[0];
        const firstConstraintMessage = firstError.constraints
          ? Object.values(firstError.constraints)[0]
          : 'Unknown error';

        return new FieldInvalid(firstConstraintMessage, firstError.property);
      },
    }),
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  await app
    .listen(PORT, () => appLogger.debug(`Server running in ${HOST}:${PORT}`))
    .catch((err) => appLogger.error(err));
}

bootstrap();
