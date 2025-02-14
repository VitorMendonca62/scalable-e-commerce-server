import { CreateUserUseCase } from '@auth/core/application/use-cases/create-user.usecase';
import {
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import {
  mockUser,
  mockCreateUserDTO,
  mockLoginUser,
  mockLoginUserDTO,
} from '@auth/helpers/tests.helper';
import * as request from 'supertest';
import { UserRepository } from '@modules/auth/core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from '../../secondary/database/repositories/inmemory-user.repository';
import { CreateSessionUseCase } from '@modules/auth/core/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@modules/auth/core/application/use-cases/get-access-token';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessagingService } from '../../secondary/messaging/messaging.service';
import { UserMapper } from '@modules/auth/core/application/mappers/user.mapper';
import { TokenService } from '@modules/auth/core/application/ports/primary/session.port';
import { JwtTokenService } from '../../secondary/token-service/jwt-token.service';

describe('AuthController', () => {
  let app: INestApplication;

  let controller: AuthController;

  let mapper: UserMapper;

  let createUserUseCase: CreateUserUseCase;
  let createSessionUseCase: CreateSessionUseCase;
  let getAccessTokenUseCase: GetAccessTokenUseCase;

  let messaging: MessagingService;

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
        MessagingService,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        {
          provide: TokenService,
          useClass: JwtTokenService,
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

    messaging = module.get<MessagingService>(MessagingService);

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(mapper).toBeDefined();
    expect(createUserUseCase).toBeDefined();
    expect(createSessionUseCase).toBeDefined();
    expect(getAccessTokenUseCase).toBeDefined();
    expect(messaging).toBeDefined();
    expect(app).toBeDefined();
  });

  describe('create', () => {
    const user = mockUser();

    beforeEach(() => {
      jest.spyOn(mapper, 'createDTOForEntity').mockImplementation(() => user);
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockImplementation(() => undefined);
      jest.spyOn(messaging, 'publish').mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters', async () => {
      const dto = mockCreateUserDTO();
      await controller.create(dto);

      expect(mapper.createDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(user);

      const { email, name, roles, username, _id, phonenumber } = user;

      expect(messaging.publish).toHaveBeenCalledWith(
        'user-created',
        { email, name, roles, username, _id, phonenumber },
        'auth',
      );
    });

    it('should create user and return sucess message', async () => {
      const dto = mockCreateUserDTO();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Usuário criado com sucesso',
        data: undefined,
      });
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

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: [
          'O username é obrigatório',
          'O nome completo é obrigatório',
          'O email é obrigatório',
          'A senha é obrigatória',
          'O telefone é obrigatório',
        ],
        statusCode: 400,
      });
    });

    it('should throw bad request error when invalid phonenumber, username and email', async () => {
      const dto = mockCreateUserDTO({
        email: 'testeexemplo.com',
        username: 'default username',
        phonenumber: '+23',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: [
          'O username não pode conter com espaços.',
          'O email tem que ser válido',
          'O telefone deve ser válido do Brasil',
        ],
        statusCode: 400,
      });
    });

    it('should throw bad request error when invalid phonenumber', async () => {
      const dto = mockCreateUserDTO({
        phonenumber: '+558199999999',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: ['O telefone deve ser válido do Brasil'],
        statusCode: 400,
      });
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
      jest.spyOn(mapper, 'loginDTOForEntity').mockImplementation(() => user);
      jest
        .spyOn(createSessionUseCase, 'execute')
        .mockImplementation(async () => returnUseCase);
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

      expect(response.body).toEqual({
        message: 'Usuário realizou login com sucesso',
        data: returnUseCase,
      });
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

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: ['O email é obrigatório', 'A senha é obrigatória'],
        statusCode: 400,
      });
    });

    it('should throw bad request error when email', async () => {
      const dto = mockCreateUserDTO({
        email: 'testeexemplo.com',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: ['O email tem que ser válido'],
        statusCode: 400,
      });
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

      expect(response).toEqual({
        messase: 'Aqui está seu token de acesso',
        data: accessToken,
      });
    });

    it('should throw forbidden exeception when no have token', async () => {
      await expect(controller.getAccessToken(undefined)).rejects.toThrow(
        new ForbiddenException('Você não tem permissão'),
      );
    });
  });
});
