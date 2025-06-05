import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import * as request from 'supertest';
import { InMemoryUserRepository } from '../../secondary/database/repositories/inmemory-user.repository';
import { CreateSessionUseCase } from '@modules/auth/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@modules/auth/application/use-cases/get-access-token';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisService } from '../../secondary/message-broker/pub-sub/redis.service';
import { JwtTokenService } from '../../secondary/token-service/jwt-token.service';
import EmailVO from '@modules/auth/domain/values-objects/email.vo';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import UsernameVO from '@modules/auth/domain/values-objects/username.vo';
import NameVO from '@modules/auth/domain/values-objects/name.vo';
import PasswordVO from '@modules/auth/domain/values-objects/password.vo';
import { TokenService } from '@modules/auth/domain/ports/primary/session.port';
import { PubSubMessageBroker } from '@modules/auth/domain/ports/secondary/pub-sub.port';
import { UserRepository } from '@modules/auth/domain/ports/secondary/user-repository.port';
import {
  mockUser,
  mockCreateUserDTO,
  mockLoginUser,
  mockLoginUserDTO,
} from '@modules/auth/infrastructure/helpers/tests.helper';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';
import { CreateUserUseCase } from '@modules/auth/application/use-cases/create-user.usecase';
import { v4 } from 'uuid';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@modules/auth/domain/types/httpResponse';
import {
  HttpFieldInvalid,
  TokenInvalid,
} from '@modules/auth/domain/types/errors/errors';

describe('AuthController', () => {
  let app: INestApplication;

  let controller: AuthController;

  let createUserUseCase: CreateUserUseCase;
  let createSessionUseCase: CreateSessionUseCase;
  let getAccessTokenUseCase: GetAccessTokenUseCase;

  let mapper: UserMapper;

  let messageBroker: PubSubMessageBroker;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.registerAsync([
          {
            name: 'MESSAGING_CLIENT',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
              const redisHost = configService.get<string>('MESSAGING_HOST');
              const redisUser = configService.get<string>('MESSAGING_USER');
              const redisPW = configService.get<string>('MESSAGING_PW');
              const redisPort = configService.get<number>('MESSAGING_PORT');

              return {
                transport: Transport.REDIS,
                options: {
                  host: redisHost,
                  port: redisPort,
                  username: redisUser,
                  password: redisPW,
                },
              };
            },
          },
        ]),
      ],
      controllers: [AuthController],
      providers: [
        ConfigService,
        UserMapper,
        CreateUserUseCase,
        CreateSessionUseCase,
        GetAccessTokenUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        {
          provide: TokenService,
          useClass: JwtTokenService,
        },
        {
          provide: PubSubMessageBroker,
          useClass: RedisService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    mapper = module.get<UserMapper>(UserMapper);

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    createSessionUseCase =
      module.get<CreateSessionUseCase>(CreateSessionUseCase);
    getAccessTokenUseCase = module.get<GetAccessTokenUseCase>(
      GetAccessTokenUseCase,
    );

    messageBroker = module.get<PubSubMessageBroker>(PubSubMessageBroker);

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
        transform: false,
        exceptionFactory: (errors) => {
          if (errors.length == 0) {
            return new HttpFieldInvalid('Erro desconhecido', 'Erro');
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
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(createUserUseCase).toBeDefined();
    expect(createSessionUseCase).toBeDefined();
    expect(mapper).toBeDefined();
    expect(getAccessTokenUseCase).toBeDefined();
    expect(messageBroker).toBeDefined();
    expect(app).toBeDefined();
  });

  describe('create', () => {
    const user = mockUser({ _id: v4() });
    const dto = mockCreateUserDTO();

    beforeEach(() => {
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockImplementation(() => undefined);
      jest.spyOn(mapper, 'createDTOForEntity').mockImplementation(() => user);
      jest.spyOn(messageBroker, 'publish').mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters', async () => {
      await controller.create(dto);

      expect(mapper.createDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(user);

      expect(messageBroker.publish).toHaveBeenCalledWith(
        'user-created',
        {
          email: dto.email,
          name: dto.name,
          roles: defaultRoles,
          username: dto.username,
          _id: '1',
          phonenumber: dto.phonenumber,
        },
        'auth',
      );
    });

    it('should create user and return sucess message', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(
        new HttpCreatedResponse('Usuário criado com sucesso'),
      );
    });

    it('should throw bad request error when no have fields', async () => {
      const dto = mockCreateUserDTO({
        email: undefined,
        name: undefined,
        password: undefined,
        phonenumber: undefined,
        username: undefined,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual(
        new HttpFieldInvalid(UsernameVO.ERROR_REQUIRED, 'username').getResponse(),
      );
    });

    it('should throw bad request error when invalid email', async () => {
      const dto = mockCreateUserDTO({
        email: EmailVO.WRONG_EXEMPLE,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual(
        new HttpFieldInvalid(EmailVO.ERROR_INVALID, 'email').getResponse(),
      );
    });

    it('should throw bad request error when password is weak', async () => {
      const dto = mockCreateUserDTO({
        password: PasswordVO.WEAK_EXEMPLE,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual(
        new HttpFieldInvalid(
          PasswordVO.ERROR_WEAK_PASSWORD,
          'password',
        ).getResponse(),
      );
    });

    it('should throw bad request error when username, name and password with min length error', async () => {
      const dto = mockCreateUserDTO({
        username: UsernameVO.MIN_LENGTH_EXEMPLE,
        name: NameVO.MIN_LENGTH_EXEMPLE,
        password: PasswordVO.MIN_LENGTH_EXEMPLE,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual(
        new HttpFieldInvalid(UsernameVO.ERROR_MIN_LENGTH, 'username').getResponse(),
      );
    });
  });

  describe('login', () => {
    const user = mockLoginUser();
    const dto = mockLoginUserDTO();

    const returnUseCase = {
      accessToken: 'Bearer TOKEN',
      refreshToken: 'Bearer TOKEN',
      type: 'Bearer' as const,
    };
    beforeEach(() => {
      jest
        .spyOn(createSessionUseCase, 'execute')
        .mockImplementation(async () => returnUseCase);
      jest.spyOn(mapper, 'loginDTOForEntity').mockImplementation(() => user);
    });

    it('should use case call with correct parameters', async () => {
      await controller.login(dto);

      expect(mapper.loginDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createSessionUseCase.execute).toHaveBeenCalledWith(user);
    });

    it('should create user and return sucess message', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual(
        new HttpCreatedResponse(
          'Usuário realizou login com sucesso',
          returnUseCase,
        ),
      );
    });

    it('should throw bad request error when no have fields', async () => {
      const dto = mockLoginUserDTO({
        email: undefined,
        password: undefined,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual(
        new HttpFieldInvalid(EmailVO.ERROR_REQUIRED, 'email').getResponse(),
      );
    });

    it('should throw bad request error when invalid email', async () => {
      const dto = mockLoginUserDTO({
        email: UsernameVO.WRONG_EXEMPLE,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual(
        new HttpFieldInvalid(EmailVO.ERROR_INVALID, 'email').getResponse(),
      );
    });

    it('should throw bad request error when password with min length error', async () => {
      const dto = mockLoginUserDTO({
        password: PasswordVO.MIN_LENGTH_EXEMPLE,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual(
        new HttpFieldInvalid(PasswordVO.ERROR_MIN_LENGTH, 'password').getResponse(),
      );
    });
  });

  describe('getAccessToken', () => {
    const refreshToken = 'Bearer REFRESHTOKEN';
    const accessToken = 'Bearer accessTOKEN';

    it('should use case call with correct parameters', async () => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockImplementation(async () => accessToken);

      await controller.getAccessToken(refreshToken);

      expect(getAccessTokenUseCase.execute).toHaveBeenCalledWith(
        'REFRESHTOKEN',
      );
    });

    it('should return token and sucess message', async () => {
      jest
        .spyOn(getAccessTokenUseCase, 'execute')
        .mockImplementation(async () => accessToken);

      const response = await controller.getAccessToken(refreshToken);

      expect(response).toEqual(
        new HttpOKResponse('Aqui está seu token de acesso', accessToken),
      );
    });

    it('should throw forbidden exeception when no have token', async () => {
      await expect(controller.getAccessToken(undefined)).rejects.toThrow(
        new TokenInvalid('Você não tem permissão'),
      );
    });

    it('should throw forbidden exeception when token is no have Bearer', async () => {
      await expect(controller.getAccessToken('undefined')).rejects.toThrow(
        new TokenInvalid('Você não tem permissão'),
      );
    });
  });
});
