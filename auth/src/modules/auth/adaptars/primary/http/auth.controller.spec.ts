import { CreateUserUseCase } from '@auth/core/application/use-cases/create-user.usecase';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { UserMapper } from '@auth/adaptars/mappers/user.mapper';
import { AuthController } from './auth.controller';
import { mockUser, mockCreatUserDTO } from '@auth/helpers/tests.helper';
import * as request from 'supertest';
import { UserRepository } from '@modules/auth/core/application/ports/secondary/user-repository.interface';
import { InMemoryUserRepository } from '../../secondary/database/repositories/inmemory-user.repository';

describe('AuthController', () => {
  let app: INestApplication;

  let controller: AuthController;

  let mapper: UserMapper;

  let createUserUseCase: CreateUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        UserMapper,
        CreateUserUseCase,
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    mapper = module.get<UserMapper>(UserMapper);

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);

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
    beforeEach(() => {
      jest
        .spyOn(mapper, 'createDTOForEntity')
        .mockImplementation((dto) => mockUser(dto));
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters', async () => {
      const dto = mockCreatUserDTO();
      await controller.create(dto);

      expect(mapper.createDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(mockUser());
    });

    it('should create user and return sucess message', async () => {
      const dto = mockCreatUserDTO();

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
      const dto = mockCreatUserDTO({
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
      const dto = mockCreatUserDTO({
        email: 'testeexemplo.com',
        phonenumber: '+23',
        username: 'default username',
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
      const dto = mockCreatUserDTO({
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
});
