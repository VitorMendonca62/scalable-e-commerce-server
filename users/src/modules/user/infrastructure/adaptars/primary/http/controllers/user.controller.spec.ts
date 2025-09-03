import { CreateUserUseCase } from '@user/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '@user/application/use-cases/delete-user.usecase';
import { GetUserUseCase } from '@user/application/use-cases/get-user.usecase';
import { UpdateUserUseCase } from '@user/application/use-cases/update-user.usecase';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { UserController } from './user.controller';
import {
  mockCreatedUserDTOToUser,
  mockCreateUserDTO,
  mockUpdateUserDTO,
  mockUserEntity,
  mockUserUpdatedDTOToUserUpdated,
} from '@user/infrastructure/helpers/tests.helper';
import { UsersQueueService } from '../../../secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { defaultRoles } from '@user/domain/types/permissions';
import {
  HttpCreatedResponse,
  HttpOKResponse,
  HttpUpdatedResponse,
} from '@user/domain/ports/primary/http/sucess.port';
import { HttpStatus } from '@nestjs/common';
import { IDConstants } from '@user/domain/values-objects/uuid/id-constants';
import { UsernameConstants } from '@user/domain/values-objects/user/username/username-constants';
import IDVO from '@user/domain/values-objects/uuid/id-vo';
import { IDValidator } from '@user/domain/values-objects/uuid/id-validator';
import { FieldInvalid } from '@modules/user/domain/ports/primary/http/error.port';

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
    getUserUseCase = { execute: jest.fn() } as any;
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

    it('should call createUserUseCase.execute with mapped DTO', async () => {
      await controller.create(dto);

      expect(userMapper.createDTOForEntity).toHaveBeenCalledWith(dto);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(user);
    });

    it('should send user-created event with correct payload', async () => {
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

    it('should return HttpCreatedResponse on success', async () => {
      const response = await controller.create(dto);

      expect(response).toBeInstanceOf(HttpCreatedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Usuário criado com sucesso',
      });
    });
    it('should throw error if use case throw error', async () => {
      jest
        .spyOn(createUserUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.create(dto)).rejects.toThrow(new Error('Erro no use case'));
    });
  });

  describe('GET /:identifier', () => {
    const id = IDConstants.EXEMPLE;
    const username = UsernameConstants.EXEMPLE;
    const user = mockUserEntity({ userId: id });

    beforeEach(() => {
      jest.spyOn(getUserUseCase, 'execute').mockResolvedValue(user);
    });

    it('should call getUserUseCase.execute with id', async () => {
      const identifier = id;
      await controller.findOne(identifier);

      expect(getUserUseCase.execute).toHaveBeenCalledWith(identifier);
    });

    it('should call getUserUseCase.execute with username', async () => {
      const identifier = username;
      await controller.findOne(identifier);

      expect(getUserUseCase.execute).toHaveBeenCalledWith(identifier);
    });

    it('should return HttpCreatedResponse on success', async () => {
      const response = await controller.findOne(username);

      expect(response).toBeInstanceOf(HttpOKResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário encontrado com sucesso',
        data: user,
      });
    });

    it('should throw error if use case throw error', async () => {
      jest
        .spyOn(getUserUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.findOne(id)).rejects.toThrow(
        new Error('Erro no use case'),
      );
    });
  });

  describe('PATCH /', () => {
    const id = IDConstants.EXEMPLE;
    const dto = mockUpdateUserDTO();
    const user = mockUserUpdatedDTOToUserUpdated(dto, new IDVO(id));

    jest.mock('@user/domain/values-objects/uuid/id-validator');

    beforeEach(() => {
      jest.spyOn(updateUserUseCase, 'execute').mockResolvedValue(dto);
      jest.spyOn(userMapper, 'updateDTOForEntity').mockReturnValue(user);
      jest.spyOn(IDValidator, 'validate').mockImplementation(jest.fn());
    });

    it('should call updateUserUseCase.execute with mapped DTO and user id', async () => {
      await controller.update(dto, id);

      expect(userMapper.updateDTOForEntity).toHaveBeenCalledWith(dto, id);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith(id, user);
    });

    it('should return HttpUpdatedResponse on success', async () => {
      const response = await controller.update(dto, id);

      expect(response).toBeInstanceOf(HttpUpdatedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário atualizado com sucesso',
        data: dto,
      });
    });

    it('should return FieldInvalid when no have fields', async () => {
      await expect(controller.update({}, id)).rejects.toThrow(
        new FieldInvalid(
          'Adicione algum campo para o usuário ser atualizado',
          'all',
        ),
      );
    });

    it('should throw error if id validator throw error', async () => {
      jest.spyOn(IDValidator, 'validate').mockImplementation(() => {
        throw new Error('Erro no id validator');
      });

      await expect(controller.update(dto, id)).rejects.toThrow(
        new Error('Erro no id validator'),
      );
    });

    it('should throw error if use case throw error', async () => {
      jest
        .spyOn(updateUserUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.update(dto, id)).rejects.toThrow(
        new Error('Erro no use case'),
      );
    });
  });
});
