import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import request from 'supertest';
import AppConfig from '@config/app.config';
import { HttpExceptionFilter } from '@auth/infrastructure/adaptars/primary/http/filters/http-exceptions-filter';
import { AppModule } from '../src/app.module';
import { EnvironmentVariables } from '@config/environment/env.validation';

describe('CertsController (E2E)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        bodyLimit: 10485760,
        logger: false,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    const configService =
      app.get<ConfigService<EnvironmentVariables>>(ConfigService);

    await app.register(fastifyCookie, {
      secret: configService.get<string>('COOKIE_SECRET'),
    });

    const appConfig = new AppConfig(configService, app);
    appConfig.configValidationPipe();
    appConfig.configCors();

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  const httpServer = () => app.getHttpServer();

  describe('GET /certs', () => {
    it('should return auth and reset-pass JWKs', () => {
      return request(httpServer())
        .get('/certs')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body.keys)).toBe(true);
          expect(res.body.keys).toHaveLength(2);

          for (const key of res.body.keys) {
            expect(key).toHaveProperty('kid');
            expect(key).toHaveProperty('alg', 'RS256');
            expect(key).toHaveProperty('use', 'sig');
          }
        });
    });
  });
});
