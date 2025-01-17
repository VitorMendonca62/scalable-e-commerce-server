import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '@user/core/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '@user/core/application/use-cases/delete-user.usecase';
import { GetUserUseCase } from '@user/core/application/use-cases/get-user.usecase';
import { GetUsersUseCase } from '@user/core/application/use-cases/get-users.usecase';
import { UpdateUserUseCase } from '@user/core/application/use-cases/update-user.usecase';
import { UserMapper } from '../../mappers/user.mapper';
import { INestApplication } from '@nestjs/common';
import {
  mockCreateDTO,
  mockUser,
  mockUserList,
} from '@user/helpers/tests.helper';
import * as request from 'supertest';

describe('UserController', () => {
  let app: INestApplication;

  let controller: UserController;

  let mapper: UserMapper;

  let createUserUseCase: CreateUserUseCase;
  let getUserUseCase: GetUserUseCase;
  let getUsersUseCase: GetUsersUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserMapper,
        CreateUserUseCase,
        GetUserUseCase,
        GetUsersUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);

    mapper = module.get<UserMapper>(UserMapper);

    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    getUserUseCase = module.get<GetUserUseCase>(GetUserUseCase);
    getUsersUseCase = module.get<GetUsersUseCase>(GetUsersUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    deleteUserUseCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);

    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(mapper).toBeDefined();
    expect(createUserUseCase).toBeDefined();
    expect(getUserUseCase).toBeDefined();
    expect(getUsersUseCase).toBeDefined();
    expect(updateUserUseCase).toBeDefined();
    expect(deleteUserUseCase).toBeDefined();
    expect(app).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      jest.spyOn(mapper, 'create').mockImplementation((dto) => mockUser(dto));
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters', async () => {
      const dto = mockCreateDTO();
      await controller.create(dto);

      expect(mapper.create).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(mockUser());
    });

    it('should create user and return sucess message', async () => {
      const dto = mockCreateDTO();

      const response = await request(app.getHttpServer())
        .post('/user')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Usuário criado com sucesso',
        data: undefined,
      });
    });

    it('should throw bad request error when no have fields', async () => {
      const dto = mockCreateDTO({
        email: undefined,
        name: undefined,
        password: undefined,
        phonenumber: undefined,
        username: undefined,
      });

      const response = await request(app.getHttpServer())
        .post('/user')
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
      const dto = mockCreateDTO({
        email: 'testeexemplo.com',
        phonenumber: '+23',
        username: 'default username',
      });

      const response = await request(app.getHttpServer())
        .post('/user')
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
      const dto = mockCreateDTO({
        phonenumber: '+55 8199999999',
      });

      const response = await request(app.getHttpServer())
        .post('/user')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: ['O telefone deve ser válido do Brasil'],
        statusCode: 400,
      });
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      jest
        .spyOn(getUsersUseCase, 'findAll')
        .mockImplementation(async () => mockUserList());
    });

    it('should use case call with correct parameters', async () => {
      await controller.findAll();

      expect(getUsersUseCase.findAll).toHaveBeenCalled();
    });

    it('should return all tasks', async () => {
      const response = await controller.findAll();

      expect(response).toEqual({
        message: 'Aqui está a listagem de todos os usuários',
        data: mockUserList(),
      });
    });
  });
});
