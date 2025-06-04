/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { addRedisClient } from './config/message-broker/redis.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpFieldInvalid } from '@modules/auth/domain/types/errors/errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Auth System')
    .setDescription('The auth system for a e-commerce store')
    .setVersion('1.0')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transform: false,
      exceptionFactory: (errors) => {
        if (errors.length == 0) {
          return new HttpFieldInvalid('Erro desconhecido');
        }

        const firstError = errors[0];
        const firstConstraintMessage = firstError.constraints
          ? Object.values(firstError.constraints)[0]
          : 'Erro desconhecido';

        return new HttpFieldInvalid(
          firstConstraintMessage,
          firstError.property,
        );
      },
    }),
  );

  const PORT = configService.get<number>('PORT') ?? 3333;
  const HOST = configService.get<string>('HOST');

  await app.listen(PORT, () =>
    new Logger('Server').debug(`Server running in ${HOST}:${PORT}`),
  );

  await addRedisClient(app, configService);
}

bootstrap();
