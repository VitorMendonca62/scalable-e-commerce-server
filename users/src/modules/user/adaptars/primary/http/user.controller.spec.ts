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
  mockCreatUserDTO,
  mockUpdateUserDTO,
  mockUser,
  mockUserList,
  mockUserUpdate,
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
      const dto = mockCreatUserDTO();
      await controller.create(dto);

      expect(mapper.create).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(mockUser());
    });

    it('should create user and return sucess message', async () => {
      const dto = mockCreatUserDTO();

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
      const dto = mockCreatUserDTO({
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
      const dto = mockCreatUserDTO({
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
      const dto = mockCreatUserDTO({
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
    const users = mockUserList();

    beforeEach(() => {
      jest
        .spyOn(getUsersUseCase, 'findAll')
        .mockImplementation(async () => users);
    });

    it('should use case call with correct parameters', async () => {
      await controller.findAll();

      expect(getUsersUseCase.findAll).toHaveBeenCalled();
    });

    it('should return all tasks', async () => {
      const response = await controller.findAll();

      expect(response).toEqual({
        message: 'Aqui está a listagem de todos os usuários',
        data: users,
      });
    });
  });

  describe('findOne', () => {
    const users = mockUserList();
    const userWithId = users[0];
    const userWithUsername = users[1];

    beforeEach(() => {
      jest
        .spyOn(getUserUseCase, 'findById')
        .mockImplementation(async () => userWithId);
      jest
        .spyOn(getUserUseCase, 'findByUsername')
        .mockImplementation(async () => userWithUsername);
    });

    it('should use case call with correct parameters and ID', async () => {
      await controller.findOne('1');

      expect(getUserUseCase.findById).toHaveBeenCalledWith('1');
    });

    it('should use case call with correct parameters and username', async () => {
      await controller.findOne(undefined, 'user01');

      expect(getUserUseCase.findByUsername).toHaveBeenCalledWith('user01');
    });

    it('should throw not found error without queries', async () => {
      await expect(controller.findOne(undefined, undefined)).rejects.toThrow(
        'Não foi possivel encontrar o usuário',
      );
    });

    it('should return filtered user by id', async () => {
      const response = await controller.findOne('1');

      expect(response).toEqual({
        message: 'Aqui está usuário pelo ID',
        data: userWithId,
      });
    });

    it('should return filtered user by username', async () => {
      const response = await controller.findOne(undefined, 'user01');

      expect(response).toEqual({
        message: 'Aqui está usuário pelo username',
        data: userWithUsername,
      });
    });
  });

  describe('update', () => {
    const dto = mockUpdateUserDTO();

    beforeEach(() => {
      jest
        .spyOn(mapper, 'update')
        .mockImplementation((dto) => mockUserUpdate(dto));
      jest
        .spyOn(updateUserUseCase, 'execute')
        .mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters', async () => {
      await controller.update('1', dto);

      expect(mapper.update).toHaveBeenCalledWith(dto);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith(
        '1',
        mockUserUpdate(dto),
      );
    });

    it('should update user and return sucess message', async () => {
      const response = await request(app.getHttpServer())
        .patch('/user/1')
        .send(dto)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Usuário atualizado com sucesso',
        data: undefined,
      });
    });

    it('should throw bad request exception when no have fields', async () => {
      jest
        .spyOn(mapper, 'update')
        .mockImplementation(() => mockUserUpdate({ username: undefined }));

      await expect(controller.update('1', {})).rejects.toThrow(
        'Adicione algum campo para o usuário ser atualizado',
      );
    });

    it('should throw not found exception when no have ID', async () => {
      await expect(controller.update(undefined, {})).rejects.toThrow(
        'Não foi possivel encontrar o usuário',
      );
    });

    it('should throw bad request error when invalid phonenumber, username and email', async () => {
      const dto = mockUpdateUserDTO({
        email: 'testeexemplo.com',
        phonenumber: '+23',
        username: 'default username',
      });

      const response = await request(app.getHttpServer())
        .patch('/user/1')
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
      const dto = mockUpdateUserDTO({
        phonenumber: '+55 8199999999',
      });

      const response = await request(app.getHttpServer())
        .patch('/user/1')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Bad Request',
        message: ['O telefone deve ser válido do Brasil'],
        statusCode: 400,
      });
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      jest
        .spyOn(deleteUserUseCase, 'execute')
        .mockImplementation(() => undefined);
    });

    it('should use case call with correct parameters', async () => {
      await controller.delete('1');

      expect(deleteUserUseCase.execute).toHaveBeenCalledWith('1');
    });

    it('should delete user and return sucess message', async () => {
      const response = await request(app.getHttpServer())
        .delete('/user/1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Usuário deletado com sucesso',
        data: undefined,
      });
    });

    it('should throw not found exception when no have ID', async () => {
      await expect(controller.delete(undefined)).rejects.toThrow(
        'Não foi possivel encontrar o usuário',
      );
    });
  });
});
