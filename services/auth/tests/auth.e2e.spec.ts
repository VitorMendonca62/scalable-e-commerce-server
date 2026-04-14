import { ExecutionContext, HttpStatus } from '@nestjs/common';
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
import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import { PermissionsSystem } from '@auth/domain/types/permissions';
import UserExternalController from '@auth/infrastructure/adaptars/primary/microservices/user.external.controller';
import * as bcrypt from 'bcryptjs';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { GoogleOAuthGuard } from '@auth/infrastructure/adaptars/primary/http/guards/google-oauth.guard';
import { GoogleUserFactory } from '@auth/infrastructure/helpers/tests/user-factory';

describe('AuthController (E2E)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(GoogleOAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          if (request.headers['is-new-user'] !== undefined) {
            request.user = GoogleUserFactory.createUserInCallbBack({
              email: 'no-existing-email@exemple.com',
            });
            return true;
          }

          request.user = GoogleUserFactory.createUserInCallbBack();
          return true;
        },
      })
      .compile();

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

    await app.get(UserExternalController).createUser({
      userID: IDConstants.EXEMPLE,
      email: userEmail,
      password: bcrypt.hashSync(PasswordConstants.EXEMPLE, 10),
      roles: [PermissionsSystem.ENTER],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  const userEmail = `auth-${EmailConstants.EXEMPLE}`;

  const httpServer = () => app.getHttpServer();

  describe('GET /auth/google', () => {
    it('should return Google OAuth2 URL', () => {
      return request(httpServer())
        .get('/auth/google')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.text).toContain(
            'https://accounts.google.com/o/oauth2/v2/auth',
          );
          expect(res.text).toContain('response_type=code');
          expect(res.text).toContain('scope=email%20profile');
        });
    });

    it('should include client_id in the response', () => {
      return request(httpServer())
        .get('/auth/google')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.text).toContain(
            `client_id=${process.env.GOOGLE_CLIENT_ID}`,
          );
        });
    });

    it('should include redirect_uri in the response', () => {
      return request(httpServer())
        .get('/auth/google')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.text).toContain(
            `redirect_uri=${process.env.GOOGLE_CALLBACK_URL}`,
          );
        });
    });
  });

  describe('GET /auth/google/callback', () => {
    it('should return success message with tokens', () => {
      return request(httpServer())
        .get('/auth/google/callback')
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário realizou login com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(Object.keys(res.body.data)).toContain('access_token');
          expect(Object.keys(res.body.data)).toContain('refresh_token');
        });
    });

    it('should return success message with tokens and send for messager broker', () => {
      return request(httpServer())
        .get('/auth/google/callback')
        .set('is-new-user', 'true')
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário realizou login com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(Object.keys(res.body.data)).toContain('access_token');
          expect(Object.keys(res.body.data)).toContain('refresh_token');
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login with invalid email format', async () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('O email deve ser válido');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject login with empty email', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: '',
          password: 'Password123!',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('O email é obrigatório');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject login with email type is number', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: 123,
          password: 'Password123!',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('O email deve ser uma string');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject login with missing email field', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          password: 'Password123!',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('O email é obrigatório');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject login with empty password', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: '',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('A senha é obrigatória');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('password');
        });
    });

    it('should reject login with missing password field', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('A senha é obrigatória');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('password');
        });
    });

    it('should reject login with password type is number', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 1234,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('A senha deve ser uma string válida');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('password');
        });
    });

    it('should reject login with password not have minimum length', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: '1234',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'A senha está muito curta. O mínimo são 8 caracteres',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('password');
        });
    });

    it('should reject login with non-existent user', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: PasswordConstants.EXEMPLE,
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Suas credenciais estão incorretas. Tente novamente',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject login with invalid password', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: 'WrongPassword123!',
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Suas credenciais estão incorretas. Tente novamente',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should return sucess message when user and password is valid', () => {
      return request(httpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: PasswordConstants.EXEMPLE,
        })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário realizou login com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(Object.keys(res.body.data)).toContain('access_token');
          expect(Object.keys(res.body.data)).toContain('refresh_token');
        });
    });

    it('should handle concurrent login attempts', async () => {
      const createPromise = Array.from({ length: 5 }, (_, i) =>
        app.get(UserExternalController).createUser({
          userID: IDConstants.EXEMPLE.replace('1', `${i + 2}`),
          email: `user${i}@examplea.com`,
          password: bcrypt.hashSync(PasswordConstants.EXEMPLE, 10),
          roles: [PermissionsSystem.ENTER],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      await Promise.all(createPromise);

      const loginPromises = Array.from({ length: 5 }, (_, i) =>
        request(httpServer())
          .post('/auth/login')
          .send({
            email: `user${i}@examplea.com`,
            password: PasswordConstants.EXEMPLE,
          }),
      );

      const responses = await Promise.all(loginPromises);

      expect(responses).toHaveLength(5);

      responses.forEach((response, index) => {
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body.message).toBe(
          'Usuário realizou login com sucesso',
        );
        expect(Object.keys(response.body.data)).toContain('access_token');
        expect(Object.keys(response.body.data)).toContain('refresh_token');
      });
    });
  });

  describe('GET /auth/token', () => {
    it('should reject token request without x-user-id header', () => {
      return request(httpServer())
        .get('/auth/token')
        .set('x-token-id', 'some-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request without x-token-id header', () => {
      return request(httpServer())
        .get('/auth/token')
        .set('x-user-id', '...')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with missing both required headers', () => {
      return request(httpServer())
        .get('/auth/token')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with empty x-user-id header', () => {
      return request(httpServer())
        .get('/auth/token')
        .set('x-user-id', '')
        .set('x-token-id', 'some-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with empty x-token-id header', () => {
      return request(httpServer())
        .get('/auth/token')
        .set('x-user-id', 'some-user-id')
        .set('x-token-id', '')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with non-existent token amd revoked token', () => {
      return request(httpServer())
        .get('/auth/token')
        .set('x-user-id', IDConstants.EXEMPLE)
        .set('x-token-id', 'non-existent-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with non-existent user', () => {
      const tokenID = 'token-id-valid-2';
      const userID = 'any-id';
      app.get(TokenRepository).saveSession(tokenID, userID, 'any', 'any');

      return request(httpServer())
        .get('/auth/token')
        .set('x-user-id', userID)
        .set('x-token-id', tokenID)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should return sucess message and data contain access token', async () => {
      const tokenID = 'token-id-valid-awdawdwd';
      const userID = IDConstants.EXEMPLE;
      await app.get(TokenRepository).saveSession(tokenID, userID, 'any', 'any');

      return request(httpServer())
        .get('/auth/token')
        .set('x-user-id', userID)
        .set('x-token-id', tokenID)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Seu token de acesso foi renovado');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(Object.keys(res.body.data)).toContain('access_token');
        });
    });
  });

  describe('POST /auth/logout', () => {
    it('should reject token request without x-user-id header', () => {
      return request(httpServer())
        .post('/auth/logout')
        .set('x-token-id', 'some-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request without x-token-id header', () => {
      return request(httpServer())
        .post('/auth/logout')
        .set('x-user-id', '...')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with missing both required headers', () => {
      return request(httpServer())
        .post('/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with empty x-user-id header', () => {
      return request(httpServer())
        .post('/auth/logout')
        .set('x-user-id', '')
        .set('x-token-id', 'some-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with empty x-token-id header', () => {
      return request(httpServer())
        .post('/auth/logout')
        .set('x-user-id', 'some-user-id')
        .set('x-token-id', '')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should reject token request with non-existent token amd revoked token', () => {
      return request(httpServer())
        .post('/auth/logout')
        .set('x-user-id', IDConstants.EXEMPLE)
        .set('x-token-id', 'non-existent-token-id')
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Sessão inválida. Faça login novamente.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
          expect(res.body.data).toBeUndefined();
        });
    });

    it('should return no content', () => {
      const tokenID = 'token-id-valid-3';
      const userID = IDConstants.EXEMPLE;
      app.get(TokenRepository).saveSession(tokenID, userID, 'any', 'any');

      return request(httpServer())
        .post('/auth/logout')
        .set('x-user-id', userID)
        .set('x-token-id', tokenID)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
