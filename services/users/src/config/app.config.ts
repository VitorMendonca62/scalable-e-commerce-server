import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv } from './environment/env.validation';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FieldInvalid } from '@modules/user/domain/ports/primary/http/error.port';

export default class AppConfig {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly app: NestFastifyApplication,
  ) {}

  configSwagger() {
    if (this.configService.get('NODE_ENV') === NodeEnv.Production) return;

    const documentBuilder = new DocumentBuilder()
      .setTitle('Users System')
      .setDescription('The Users system for a e-commerce store')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(this.app, documentBuilder);

    SwaggerModule.setup('docs', this.app, document, {
      swaggerOptions: {
        requestInterceptor: (req) => {
          req.credentials = 'include';
          return req;
        },
      },
    });
  }

  configCors() {
    // TODO: Configurar os hosts dps
    // app.enableCors({
    //   origin:
    //     this.configService.get('NODE_ENV') === NodeEnv.Production
    //       ? `http://localhost:`
    //       : [`http://localhost:${PORT}`],
    //   credentials: true,
    //   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    //   allowedHeaders: ['Content-Type', 'Authorization'],
    // });
  }

  configValidationPipe() {
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
        transform: false,
        exceptionFactory: (errors) => {
          if (errors.length === 0) {
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
  }
}
