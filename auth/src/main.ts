import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { addRabbitMQClient } from './config/message-broker/rabbitmq.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { FieldInvalid } from '@auth/domain/ports/primary/http/errors.port';
import { EnvironmentVariables } from './config/environment/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appLogger = new Logger('API');

  const config = new DocumentBuilder()
    .setTitle('Auth System')
    .setDescription('The auth system for a e-commerce store')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'refresh_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);

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

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  await app
    .listen(PORT, () => appLogger.debug(`Server running in ${HOST}:${PORT}`))
    .catch((err) => appLogger.error(err));

  // await addRabbitMQClient(app, configService);
}

bootstrap();
