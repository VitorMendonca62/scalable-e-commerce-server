/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { addRabbitMQClient } from './config/message-broker/rabbitmq.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { EnvironmentVariables } from './config/environment/env.validation';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Users System')
    .setDescription('The users system for a e-commerce store')
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
          return new FieldInvalid('Erro desconhecido', 'Erro');
        }

        const firstError = errors[0];
        const firstConstraintMessage = firstError.constraints
          ? Object.values(firstError.constraints)[0]
          : 'Erro desconhecido';

        return new FieldInvalid(firstConstraintMessage, firstError.property);
      },
    }),
  );

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  await app.listen(PORT, () =>
    new Logger('Server').debug(`Server running in ${HOST}:${PORT}`),
  );

  // await addRabbitMQClient(app, configService);
}

bootstrap();
