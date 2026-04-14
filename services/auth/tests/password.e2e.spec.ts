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
import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import UserExternalController from '@auth/infrastructure/adaptars/primary/microservices/user.external.controller';
import * as bcrypt from 'bcryptjs';
import { PermissionsSystem } from '@auth/domain/types/permissions';
import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';

describe('PasswordController (E2E)', () => {
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

  const userID = IDConstants.EXEMPLE.replace('1', '0');
  const userEmail = `password-${EmailConstants.EXEMPLE}`;

  beforeAll(async () => {
    await app.get(UserExternalController).createUser({
      userID: userID,
      email: userEmail,
      password: bcrypt.hashSync(PasswordConstants.EXEMPLE, 10),
      roles: [PermissionsSystem.ENTER],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  const httpServer = () => app.getHttpServer();

  describe('POST /pass/send-code', () => {
    it('should reject invalid email format', () => {
      return request(httpServer())
        .post('/pass/send-code')
        .send({
          email: EmailConstants.WRONG_EXEMPLE,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_INVALID);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject empty email', () => {
      return request(httpServer())
        .post('/pass/send-code')
        .send({
          email: '',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_REQUIRED);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject email type number', () => {
      return request(httpServer())
        .post('/pass/send-code')
        .send({
          email: 123,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_STRING);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject missing email field', () => {
      return request(httpServer())
        .post('/pass/send-code')
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_REQUIRED);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should return success message with valid email', () => {
      return request(httpServer())
        .post('/pass/send-code')
        .send({
          email: EmailConstants.EXEMPLE,
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Código de recuperação enviado com sucesso. Verifique seu email.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data).toBeUndefined();
        });
    });
  });

  describe('POST /pass/validate-code', () => {
    it('should reject invalid email format', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: EmailConstants.WRONG_EXEMPLE,
          code: 'ABC123',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_INVALID);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject empty email', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: '',
          code: 'ABC123',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_REQUIRED);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject email type number', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: 123,
          code: 'ABC123',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_STRING);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject missing email field', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_REQUIRED);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject missing code', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'O código de recuperação é obrigatório.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('code');
        });
    });

    it('should reject empty code', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
          code: '',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'O código de recuperação é obrigatório.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('code');
        });
    });

    it('should reject code type number', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
          code: 123456,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('O código deve ser uma string válida.');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('code');
        });
    });

    it('should reject code with invalid length', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
          code: '12345',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'O código de recuperação deve ter exatamente 6 caracteres.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('code');
        });
    });

    it('should return bad request when code is invalid', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: userEmail,
          code: 'ABC124',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Código de recuperação inválido ou expirado. Tente novamente',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('code');
        });
    });

    it('should return bad request when email is invalid', () => {
      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
          code: 'ABC123',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Código de recuperação inválido ou expirado. Tente novamente',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('code');
        });
    });

    it('should return bad request when code is expired', async () => {
      await app.get(EmailCodeRepository).save({
        email: userEmail,
        code: 'ABC126',
        expiresIn: new Date('Wed Apr 01 2000'),
      });

      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
          code: 'ABC126',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Código de recuperação inválido ou expirado. Tente novamente',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('code');
        });
    });

    it('should return success message with reset token', async () => {
      await app.get(EmailCodeRepository).save({
        email: userEmail,
        code: 'ABC123',
        expiresIn: new Date('Wed Apr 01 2030'),
      });

      return request(httpServer())
        .post('/pass/validate-code')
        .send({
          email: userEmail,
          code: 'ABC123',
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Seu código de recuperação de senha foi validado com sucesso.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(Object.keys(res.body.data)).toContain('reset_pass_token');
        });
    });
  });

  describe('PATCH /pass/reset', () => {
    it('should reject weak new password', () => {
      return request(httpServer())
        .patch('/pass/reset')
        .set('x-user-email', EmailConstants.EXEMPLE)
        .send({
          newPassword: PasswordConstants.WEAK_EXEMPLE,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'A nova senha está muito fraca. Ela deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('newPassword');
        });
    });

    it('should reject empyt new password', () => {
      return request(httpServer())
        .patch('/pass/reset')
        .set('x-user-email', EmailConstants.EXEMPLE)
        .send({
          newPassword: '',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('A nova senha é obrigatória');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('newPassword');
        });
    });

    it('should reject missing new password', () => {
      return request(httpServer())
        .patch('/pass/reset')
        .set('x-user-email', EmailConstants.EXEMPLE)
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe('A nova senha é obrigatória');
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('newPassword');
        });
    });

    it('should reject new password type is number', () => {
      return request(httpServer())
        .patch('/pass/reset')
        .set('x-user-email', EmailConstants.EXEMPLE)
        .send({
          newPassword: 1234,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'A nova senha deve ser uma string válida',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('newPassword');
        });
    });

    it('should reject new password length is invalid', () => {
      return request(httpServer())
        .patch('/pass/reset')
        .set('x-user-email', EmailConstants.EXEMPLE)
        .send({
          newPassword: '%Vm12',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'A nova senha está muito curta. O mínimo são 8 caracteres',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('newPassword');
        });
    });

    it('should return unauthorized when not found user', () => {
      return request(httpServer())
        .patch('/pass/reset')
        .set('x-user-email', 'teste@teste.com')
        .send({
          newPassword: PasswordConstants.EXEMPLE,
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe('Token inválido ou expirado');
          expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
        });
    });

    it('should return success message when password is updated', () => {
      return request(httpServer())
        .patch('/pass/reset')
        .set('x-user-email', EmailConstants.EXEMPLE)
        .send({
          newPassword: PasswordConstants.EXEMPLE,
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Senha atualizada com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data).toBeUndefined();
        });
    });
  });

  describe('PATCH /pass', () => {
    describe('reject new passoword', () => {
      it('should reject weak password', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            newPassword: PasswordConstants.WEAK_EXEMPLE,
            oldPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(
              'A nova senha está muito fraca. Ela deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
            );
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('newPassword');
          });
      });

      it('should reject empyt password', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            newPassword: '',
            oldPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe('A nova senha é obrigatória');
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('newPassword');
          });
      });

      it('should reject missing password', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            oldPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe('A nova senha é obrigatória');
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('newPassword');
          });
      });

      it('should reject password type is number', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            newPassword: 1234,
            oldPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(
              'A nova senha deve ser uma string válida',
            );
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('newPassword');
          });
      });

      it('should reject password length is invalid', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            newPassword: '%Vm12',
            oldPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(
              'A nova senha está muito curta. O mínimo são 8 caracteres',
            );
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('newPassword');
          });
      });
    });

    describe('reject old passoword', () => {
      it('should reject empyt password', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            oldPassword: '',
            newPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe('A senha antiga é obrigatória');
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('oldPassword');
          });
      });

      it('should reject missing password', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            newPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe('A senha antiga é obrigatória');
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('oldPassword');
          });
      });

      it('should reject password type is number', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            oldPassword: 1234,
            newPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(
              'A senha antiga deve ser uma string válida',
            );
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('oldPassword');
          });
      });

      it('should reject password length is invalid', () => {
        return request(httpServer())
          .patch('/pass')
          .set('x-user-id', userID)
          .send({
            oldPassword: '%Vm12',
            newPassword: PasswordConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(
              'A senha antiga está muito curta. O mínimo são 8 caracteres',
            );
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('oldPassword');
          });
      });
    });

    it('should return not found when user does not exist', () => {
      return request(httpServer())
        .patch('/pass')
        .set('x-user-id', 'missing-user')
        .send({
          newPassword: PasswordConstants.EXEMPLE,
          oldPassword: PasswordConstants.EXEMPLE,
        })
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário não encontrado.');
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it('should return bad request when old password is invalid', () => {
      return request(httpServer())
        .patch('/pass')
        .set('x-user-id', userID)
        .send({
          newPassword: PasswordConstants.EXEMPLE,
          oldPassword: '$Vhmq12345678',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'A senha atual informada está incorreta.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('oldPassword');
        });
    });

    it('should return success message when password is updated', () => {
      return request(httpServer())
        .patch('/pass')
        .set('x-user-id', userID)
        .send({
          newPassword: PasswordConstants.EXEMPLE,
          oldPassword: PasswordConstants.EXEMPLE,
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('A senha do usuário foi atualizada!');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data).toBeUndefined();
        });
    });
  });
});
