import { CreateUserUseCase } from '@auth/core/application/use-cases/create-user.usecase';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { UserMapper } from '@auth/adaptars/mappers/user.mapper';
import { AuthController } from './auth.controller';
import { mockUser, mockCreateUserDTO } from '@auth/helpers/tests.helper';
import * as request from 'supertest';
import { UserRepository } from '@modules/auth/core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from '../../secondary/database/repositories/inmemory-user.repository';
import { ConfigModule } from '@nestjs/config';
import { CreateSessionUseCase } from '@modules/auth/core/application/use-cases/create-session.usecase';
import { JwtTokenService } from '@modules/auth/core/application/services/jwt-token.service';

describe('AuthController', () => {
  let app: INestApplication;

  let controller: AuthController;

  let mapper: UserMapper;

  let createUserUseCase: CreateUserUseCase;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let createSessionUseCase: CreateSessionUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [AuthController],
      providers: [
        UserMapper,
        CreateUserUseCase,
        CreateSessionUseCase,
        JwtTokenService,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    mapper = module.get<UserMapper>(UserMapper);

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    createSessionUseCase =
      module.get<CreateSessionUseCase>(CreateSessionUseCase);

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(mapper).toBeDefined();
    expect(createUserUseCase).toBeDefined();
    expect(app).toBeDefined();
  });

  describe('create', () => {
    const user = mockUser();

    beforeEach(() => {
      jest.spyOn(mapper, 'createDTOForEntity').mockImplementation(() => user);
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters', async () => {
      const dto = mockCreateUserDTO();
      await controller.create(dto);

      expect(mapper.createDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(user);
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
        phonenumber: '+55 8199999999',
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

  // describe('login', () => {
  //   const user = mockLoginUser();
  //   const dto = mockLoginUserDTO();

  //   const returnUseCase = {
  //     accessToken: 'Bearer TOKEN',
  //     refreshToken: 'Bearer TOKEN',
  //     type: 'Bearer' as const,
  //   };
  //   beforeEach(() => {
  //     jest.spyOn(mapper, 'loginDTOForEntity').mockImplementation(() => user);
  //     jest
  //       .spyOn(createSessionUseCase, 'execute')
  //       .mockImplementation(async () => returnUseCase);
  //   });

  //   it('should use case call with correct parameters', async () => {
  //     await controller.login(dto);

  //     expect(mapper.loginDTOForEntity).toHaveBeenCalledWith(dto);
  //     expect(createSessionUseCase.execute).toHaveBeenCalledWith(user);
  //   });

  //   it('should create user and return sucess message', async () => {
  //     const response = await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send(dto)
  //       .expect(201);

  //     expect(response.body).toEqual({
  //       message: 'Usuário realizou login com sucesso',
  //       data: returnUseCase,
  //     });
  //   });

  //   it('should throw bad request error when no have fields', async () => {
  //     const dto = mockLoginUserDTO({
  //       email: undefined,
  //       password: undefined,
  //     });

  //     const response = await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send(dto)
  //       .expect(400);

  //     expect(response.body).toEqual({
  //       error: 'Bad Request',
  //       message: ['O email é obrigatório', 'A senha é obrigatória'],
  //       statusCode: 400,
  //     });
  //   });

  //   it('should throw bad request error when email', async () => {
  //     const dto = mockCreateUserDTO({
  //       email: 'testeexemplo.com',
  //     });

  //     const response = await request(app.getHttpServer())
  //       .post('/auth/login')
  //       .send(dto)
  //       .expect(400);

  //     expect(response.body).toEqual({
  //       error: 'Bad Request',
  //       message: ['O email tem que ser válido'],
  //       statusCode: 400,
  //     });
  //   });
  // });
});
