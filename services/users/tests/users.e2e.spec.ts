import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from '../src/app.module';
import AppConfig from '@config/app.config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { HttpExceptionFilter } from '@user/infrastructure/adaptars/primary/http/filters/http-exceptions-filter';
import EmailCodeRepository from '@user/domain/ports/secondary/email-code-repository.port';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';
import { EmailSender } from '@user/domain/ports/secondary/mail-sender.port';
import { defaultRoles } from '@user/domain/constants/roles';
import { UserRecord } from '@user/domain/types/user-record';
import IDConstants from '@user/domain/values-objects/common/uuid/id-constants';
import {
  EmailConstants,
  NameConstants,
  PhoneNumberConstants,
  UsernameConstants,
  AvatarConstants,
} from '@user/domain/values-objects/user/constants';
import { PasswordConstants } from '@user/domain/constants/password-constants';
import { Cookies } from '@user/domain/enums/cookies.enum';
import { HttpStatus } from '@nestjs/common';
import { UsersQueueService } from '@user/infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { ValidateEmailUseCase } from '@user/application/use-cases/user/validate-email-usecase';
import { UserController } from '@user/infrastructure/adaptars/primary/http/controllers/user.controller';
import { v7 } from 'uuid';

describe('UserController (E2E)', () => {
  let app: NestFastifyApplication;
  let userRepository: UserRepository;
  let emailCodeRepository: EmailCodeRepository;

  const FIXED_EMAIL_CODE = '123456';

  const seedUser = async (overrides: Partial<UserRecord> = {}) => {
    const now = new Date();
    const userRecord: UserRecord = {
      userID: v7(),
      name: `users ${NameConstants.EXEMPLE}`,
      username: `users-${UsernameConstants.EXEMPLE}`,
      email: `users-${EmailConstants.EXEMPLE}`,
      avatar: null,
      phoneNumber: PhoneNumberConstants.EXEMPLE,
      roles: defaultRoles,
      addresses: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: overrides.deletedAt ?? null,
      ...overrides,
    };

    await userRepository.create(userRecord);
    return userRecord;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersQueueService)
      .useValue({
        send: async () => true,
      })
      .overrideProvider(EmailSender)
      .useValue({
        send: async () => true,
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

    await app.register(fastifyCookie as any, {
      secret: configService.get<string>('COOKIE_SECRET'),
    });

    const appConfig = new AppConfig(configService, app);
    appConfig.configValidationPipe();
    appConfig.configCors();

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    userRepository = app.get(UserRepository);

    emailCodeRepository = app.get(EmailCodeRepository);
  });

  const httpServer = () => app.getHttpServer();

  describe('POST /users/validate-email', () => {
    it('should reject when email is missing', () => {
      return request(httpServer())
        .post('/users/validate-email')
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_REQUIRED);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject when email is empty', () => {
      return request(httpServer())
        .post('/users/validate-email')
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

    it('should reject when email is not a string', () => {
      return request(httpServer())
        .post('/users/validate-email')
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

    it('should reject when email is invalid', () => {
      return request(httpServer())
        .post('/users/validate-email')
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

    it('should send validation code', () => {
      return request(httpServer())
        .post('/users/validate-email')
        .send({
          email: EmailConstants.EXEMPLE,
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Código enviado com sucesso para seu email.',
          );
          expect(res.body.statusCode).toBe(HttpStatus.OK);
        });
    });
  });

  describe('POST /users/validate-code', () => {
    beforeEach(() => {
      emailCodeRepository.deleteMany(EmailConstants.EXEMPLE);
    });

    it('should reject when email is missing', () => {
      return request(httpServer())
        .post('/users/validate-code')
        .send({})
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_REQUIRED);
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject when email is empty', () => {
      return request(httpServer())
        .post('/users/validate-code')
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

    it('should reject when email is not a string', () => {
      return request(httpServer())
        .post('/users/validate-code')
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

    it('should reject when email is invalid', () => {
      return request(httpServer())
        .post('/users/validate-code')
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

    it('should reject when code is missing', () => {
      return request(httpServer())
        .post('/users/validate-code')
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

    it('should reject when code is empty', () => {
      return request(httpServer())
        .post('/users/validate-code')
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

    it('should reject when code is not a string', () => {
      return request(httpServer())
        .post('/users/validate-code')
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

    it('should reject when code has invalid length', () => {
      return request(httpServer())
        .post('/users/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
          code: '123',
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

    it('should reject when code is invalid', () => {
      return request(httpServer())
        .post('/users/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
          code: FIXED_EMAIL_CODE,
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Código de validação inválido ou expirado. Tente novamente',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('should validate code and return sign-up token', async () => {
      await emailCodeRepository.save(EmailConstants.EXEMPLE, FIXED_EMAIL_CODE);

      return request(httpServer())
        .post('/users/validate-code')
        .send({
          email: EmailConstants.EXEMPLE,
          code: FIXED_EMAIL_CODE,
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Código validado com sucesso.');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(Object.keys(res.body.data)).toContain(Cookies.SignUpToken);
        });
    });
  });

  describe('POST /users', () => {
    describe('reject name', () => {
      it('should reject when name is empty', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            username: UsernameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            name: '',
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(NameConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('name');
          });
      });

      it('should reject when name is missing', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            username: UsernameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(NameConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('name');
          });
      });

      it('should reject when name is not a string', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            username: UsernameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            name: 123,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(NameConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('name');
          });
      });

      it('should reject when name is too short', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            username: UsernameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            name: NameConstants.MIN_LENGTH_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(NameConstants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('name');
          });
      });
    });

    describe('reject username', () => {
      it('should reject when username is empty', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            username: '',
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            name: NameConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });

      it('should reject when username is missing', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });

      it('should reject when username is not a string', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            name: NameConstants.EXEMPLE,
            username: 123,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });

      it('should reject when username is too short', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: UsernameConstants.MIN_LENGTH_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });

      it('should reject when username have spaces', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: UsernameConstants.ERROR_NO_SPACES_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_NO_SPACES);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });
    });

    describe('reject password', () => {
      it('should reject when password is empty', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            password: '',
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PasswordConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('password');
          });
      });

      it('should reject when password is missing', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PasswordConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('password');
          });
      });

      it('should reject when password is not a string', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            password: 123,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PasswordConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('password');
          });
      });

      it('should reject when password is too short', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            password: PasswordConstants.MIN_LENGTH_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PasswordConstants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('password');
          });
      });

      it('should reject when password is weak', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            password: PasswordConstants.WEAK_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(
              PasswordConstants.ERROR_WEAK_PASSWORD,
            );
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('password');
          });
      });
    });

    describe('reject phonenumber', () => {
      it('should reject when phone number is empty', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            phoneNumber: '',
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });

      it('should reject when phone number is missing', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });

      it('should reject when phone number is not a string', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            phoneNumber: 123,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });

      it('should reject when phone number has invalid length', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.ERROR_LENGTH_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });

      it('should reject when phone number is invalid', () => {
        return request(httpServer())
          .post('/users')
          .set('x-user-email', EmailConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            password: PasswordConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.ERROR_INVALID_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_INVALID);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });
    });

    it('should reject when email already exists', async () => {
      const email = `users-email.already${EmailConstants.EXEMPLE}`;

      await seedUser({
        username: `users-email.noready${UsernameConstants.EXEMPLE}`,
        email,
      });

      return request(httpServer())
        .post('/users')
        .set('x-user-email', email)
        .send({
          name: NameConstants.EXEMPLE,
          password: PasswordConstants.EXEMPLE,
          username: UsernameConstants.EXEMPLE,
          phoneNumber: PhoneNumberConstants.EXEMPLE,
        })
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.message).toBe(EmailConstants.ERROR_ALREADY_EXISTS);
          expect(res.body.statusCode).toBe(HttpStatus.CONFLICT);
          expect(res.body.data).toBe('email');
        });
    });

    it('should reject when username already exists', async () => {
      const email = `users-username.already1${EmailConstants.EXEMPLE}`;

      const user = await seedUser({
        username: `users-username.already1${UsernameConstants.EXEMPLE}`,
        email,
      });

      return request(httpServer())
        .post('/users')
        .set('x-user-email', `users-username.already2${EmailConstants.EXEMPLE}`)
        .send({
          name: NameConstants.EXEMPLE,
          password: PasswordConstants.EXEMPLE,
          username: user.username,
          phoneNumber: PhoneNumberConstants.EXEMPLE,
        })
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.message).toBe(UsernameConstants.ERROR_ALREADY_EXISTS);
          expect(res.body.statusCode).toBe(HttpStatus.CONFLICT);
          expect(res.body.data).toBe('username');
        });
    });

    it('should create user successfully', async () => {
      const email = `users-username.sucess${EmailConstants.EXEMPLE}`;

      return request(httpServer())
        .post('/users')
        .set('x-user-email', email)
        .send({
          username: `users-${UsernameConstants.EXEMPLE}`,
          name: NameConstants.EXEMPLE,
          password: PasswordConstants.EXEMPLE,
          phoneNumber: PhoneNumberConstants.EXEMPLE,
        })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário criado com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.CREATED);
          expect(res.body.data).toBeUndefined();
        });
    });
  });

  describe('GET /users/:identifier', () => {
    it('should return not found for unknown userID', () => {
      return request(httpServer())
        .get(`/users/${IDConstants.EXEMPLE}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe('Não foi possivel encontrar o usuário');
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it('should return not found for unknown username', () => {
      return request(httpServer())
        .get(`/users/${UsernameConstants.EXEMPLE}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe('Não foi possivel encontrar o usuário');
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it('should return user by userID', async () => {
      const userID = IDConstants.EXEMPLE.replace('1', '0');
      const user = await seedUser({
        userID: userID,
        username: `findOne.${UsernameConstants.EXEMPLE}`,
        email: `findOne.${EmailConstants.EXEMPLE}`,
      });

      return request(httpServer())
        .get(`/users/${userID}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário encontrado com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data).toMatchObject({
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
          });
        });
    });

    it('should return user by username', async () => {
      const userID = IDConstants.EXEMPLE.replace('1', '2');
      const user = await seedUser({
        userID: userID,
        username: `findOne2.${UsernameConstants.EXEMPLE}`,
        email: `findOne2.${EmailConstants.EXEMPLE}`,
      });

      return request(httpServer())
        .get(`/users/${user.username}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário encontrado com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data).toMatchObject({
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
          });
        });
    });
  });

  describe('PATCH /users', () => {
    describe('reject name', () => {
      it('should reject when name is empty', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            username: UsernameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            name: '',
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(NameConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('name');
          });
      });

      it('should reject when name is not a string', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            username: UsernameConstants.EXEMPLE,
            avatar: AvatarConstants.EXEMPLE,
            name: 123,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(NameConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('name');
          });
      });

      it('should reject when name is too short', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            username: UsernameConstants.EXEMPLE,
            avatar: AvatarConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            name: NameConstants.MIN_LENGTH_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(NameConstants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('name');
          });
      });
    });

    describe('reject username', () => {
      it('should reject when username is empty', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            username: '',
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            name: NameConstants.EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });

      it('should reject when username is not a string', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            avatar: AvatarConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: 123,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });

      it('should reject when username is too short', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            avatar: AvatarConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.EXEMPLE,
            username: UsernameConstants.MIN_LENGTH_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_MIN_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });

      it('should reject when username have spaces', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            username: UsernameConstants.ERROR_NO_SPACES_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(UsernameConstants.ERROR_NO_SPACES);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('username');
          });
      });
    });

    describe('reject phonenumber', () => {
      it('should reject when phone number is empty', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            avatar: AvatarConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            phoneNumber: '',
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });

      it('should reject when phone number is not a string', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            avatar: AvatarConstants.EXEMPLE,
            phoneNumber: 123,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });

      it('should reject when phone number has invalid length', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            phoneNumber: PhoneNumberConstants.ERROR_LENGTH_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_LENGTH);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });

      it('should reject when phone number is invalid', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            phoneNumber: PhoneNumberConstants.ERROR_INVALID_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(PhoneNumberConstants.ERROR_INVALID);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('phoneNumber');
          });
      });
    });

    describe('reject avatar', () => {
      it('should reject when avatar is empty', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            username: UsernameConstants.EXEMPLE,
            avatar: '',
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(AvatarConstants.ERROR_REQUIRED);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('avatar');
          });
      });

      it('should reject when avatar is not a string', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            avatar: AvatarConstants.ERROR_STRING_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(AvatarConstants.ERROR_STRING);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('avatar');
          });
      });

      it('should reject when avatar is invalid', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            avatar: AvatarConstants.ERROR_INVALID_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(AvatarConstants.ERROR_INVALID);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('avatar');
          });
      });

      it('should reject when avatar is too long', () => {
        return request(httpServer())
          .patch('/users')
          .set('x-user-id', IDConstants.EXEMPLE)
          .send({
            name: NameConstants.EXEMPLE,
            avatar: AvatarConstants.ERROR_TOO_LONG_EXEMPLE,
          })
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toBe(AvatarConstants.ERROR_TOO_LONG);
            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.data).toBe('avatar');
          });
      });
    });

    it('should reject when no have update fields', async () => {
      return request(httpServer())
        .patch('/users')
        .set('x-user-id', 'teste')
        .send()
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Adicione algum campo para o usuário ser atualizado',
          );
          expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(res.body.data).toBe('all');
        });
    });

    it('should reject when username already exists', async () => {
      const firstUser = await seedUser({
        username: 'firstuser',
        email: `users-patch-1-${EmailConstants.EXEMPLE}`,
        userID: IDConstants.EXEMPLE.replace('1', '3'),
      });

      const secondUser = await seedUser({
        username: 'seconduser',
        email: `users-patch-2-${EmailConstants.EXEMPLE}`,
        userID: IDConstants.EXEMPLE.replace('1', '4'),
      });

      return request(httpServer())
        .patch('/users')
        .set('x-user-id', firstUser.userID)
        .send({
          username: secondUser.username,
        })
        .expect(HttpStatus.CONFLICT)
        .expect((res) => {
          expect(res.body.message).toBe(UsernameConstants.ERROR_ALREADY_EXISTS);
          expect(res.body.statusCode).toBe(HttpStatus.CONFLICT);
          expect(res.body.data).toBe('username');
        });
    });

    it('should update user data', async () => {
      const user = await seedUser({
        username: 'thirduser',
        email: `users-patch-3-${EmailConstants.EXEMPLE}`,
        userID: IDConstants.EXEMPLE.replace('1', '5'),
      });
      const updates = {
        name: NameConstants.EXEMPLE,
        avatar: AvatarConstants.EXEMPLE,
      };

      await request(httpServer())
        .patch('/users')
        .set('x-user-id', user.userID)
        .send(updates)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário atualizado com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
          expect(res.body.data).toMatchObject(updates);
        });

      const updatedUser = await userRepository.findOne({
        userID: user.userID,
      });

      expect(updatedUser?.name).toBe(updates.name);
      expect(updatedUser?.avatar).toBe(updates.avatar);
    });

    it('should reject when user not found', async () => {
      const updates = {
        name: NameConstants.EXEMPLE,
        avatar: AvatarConstants.EXEMPLE,
      };

      await request(httpServer())
        .patch('/users')
        .set('x-user-id', IDConstants.EXEMPLE)
        .send(updates)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe('Não foi possivel encontrar o usuário');
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
          expect(res.body.data).toBeUndefined();
        });
    });
  });

  describe('DELETE /users', () => {
    it('should return not found when user does not exist', () => {
      return request(httpServer())
        .delete('/users')
        .set('x-user-id', IDConstants.EXEMPLE)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.message).toBe('Não foi possivel encontrar o usuário');
          expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it('should delete user successfully', async () => {
      const user = await seedUser({
        username: 'fourtyuser',
        email: `users-patch-4-${EmailConstants.EXEMPLE}`,
        userID: IDConstants.EXEMPLE.replace('1', '6'),
      });

      await request(httpServer())
        .delete('/users')
        .set('x-user-id', user.userID)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toBe('Usuário deletado com sucesso');
          expect(res.body.statusCode).toBe(HttpStatus.OK);
        });

      const deletedUser = await userRepository.findOne({
        userID: user.userID,
      });

      expect(deletedUser?.deletedAt).not.toBeNull();
    });
  });
});
