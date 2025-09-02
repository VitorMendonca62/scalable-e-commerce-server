import { CreateUserUseCase } from '@modules/user2/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '@modules/user2/application/use-cases/delete-user.usecase';
import { GetUserUseCase } from '@modules/user2/application/use-cases/get-user.usecase';
import { UpdateUserUseCase } from '@modules/user2/application/use-cases/update-user.usecase';
import { UserRepository } from '@modules/user2/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@modules/user2/infrastructure/mappers/user.mapper';
import { TestingModule, Test } from '@nestjs/testing';
import { request } from 'http';
import { InMemoryUserRepository } from '../../../secondary/database/repositories/users/inmemory-user.repository';
import { UserController } from './user.controller';
import {
  mockCreatedUserDTOToUser,
  mockCreateUserDTO,
  mockUser,
  mockUserEntity,
} from '@modules/user2/infrastructure/helpers/tests.helper';
import { UsersQueueService } from '../../../secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { defaultRoles } from '@modules/user2/domain/types/permissions';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@modules/user2/domain/ports/primary/http/sucess.port';
import { HttpStatus } from '@nestjs/common';
import { IDConstants } from '@modules/user2/domain/values-objects/uuid/id-constants';
import { UsernameConstants } from '@modules/user2/domain/values-objects/user/username/username-constants';

describe('UserController', () => {
  let controller: UserController;

  let userMapper: UserMapper;

  let createUserUseCase: CreateUserUseCase;
  let getUserUseCase: GetUserUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;

  let usersQueueService: UsersQueueService;

  beforeEach(async () => {
    userMapper = {
      createDTOForEntity: jest.fn(),
      updateDTOForEntity: jest.fn(),
    } as any;
    createUserUseCase = { execute: jest.fn() } as any;
    getUserUseCase = { findById: jest.fn(), findByUsername: jest.fn() } as any;
    updateUserUseCase = { execute: jest.fn() } as any;
    deleteUserUseCase = { execute: jest.fn() } as any;

    usersQueueService = { send: jest.fn() } as any;

    controller = new UserController(
      userMapper,
      createUserUseCase,
      getUserUseCase,
      updateUserUseCase,
      deleteUserUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userMapper).toBeDefined();
    expect(createUserUseCase).toBeDefined();
    expect(getUserUseCase).toBeDefined();
    expect(updateUserUseCase).toBeDefined();
    expect(deleteUserUseCase).toBeDefined();
  });

  describe('POST /', () => {
    const id = IDConstants.EXEMPLE;
    const dto = mockCreateUserDTO();
    const user = mockCreatedUserDTOToUser(dto, { userId: id });

    beforeEach(() => {
      jest.spyOn(createUserUseCase, 'execute').mockReturnValue(undefined);
      jest.spyOn(usersQueueService, 'send').mockReturnValue(undefined);
      jest.spyOn(userMapper, 'createDTOForEntity').mockReturnValue(user);
    });

    describe('should call createUserUseCase.execute with mapped DTO', async () => {
      await controller.create(dto);

      expect(userMapper.createDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(user);
    });

    describe('should send user-created event with correct payload', async () => {
      await controller.create(dto);

      expect(usersQueueService.send).toHaveBeenCalledWith('user-created', {
        id,
        email: dto.email,
        password: dto.password,
        name: dto.name,
        roles: defaultRoles,
        email_verified: false,
        phone_verified: false,
      });
    });

    describe('should return HttpCreatedResponse on success', async () => {
      const response = await controller.create(dto);

      expect(response).toBeInstanceOf(HttpCreatedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Usuário criado com sucesso',
      });
    });
    describe('should throw error if use case throw error', async () => {
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.create(dto)).rejects.toThrow('Erro no use case');
    });
  });

  describe('GET /:identifier', () => {
    const id = IDConstants.EXEMPLE;
    const username = UsernameConstants.EXEMPLE;
    const user = mockUserEntity({ userId: id });

    beforeEach(() => {
      jest.spyOn(getUserUseCase, 'execute').mockResolvedValue(user);
    });

    describe('should call getUserUseCase.execute with id', async () => {
      const identifier = id;
      await controller.findOne(identifier);

      expect(getUserUseCase.execute).toHaveBeenCalledWith(identifier);
    });

    describe('should call getUserUseCase.execute with username', async () => {
      const identifier = username;
      await controller.findOne(identifier);

      expect(getUserUseCase.execute).toHaveBeenCalledWith(identifier);
    });

    describe('should return HttpCreatedResponse on success', async () => {
      const response = await controller.findOne(username);

      expect(response).toBeInstanceOf(HttpOKResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário encontrado com sucesso',
        data: user,
      });
    });

    describe('should throw error if use case throw error', async () => {
      jest
        .spyOn(getUserUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.findOne(id)).rejects.toThrow('Erro no use case');
    });
  });
});
