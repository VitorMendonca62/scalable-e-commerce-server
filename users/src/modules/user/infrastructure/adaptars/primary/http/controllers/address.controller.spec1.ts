import { AddUserAddressUseCase } from '@modules/user/application/use-cases/add-user-address.usecase';
import { DeleteUserAddressUseCase } from '@modules/user/application/use-cases/delete-user-address.usecase';
import { GetUserAddressUseCase } from '@modules/user/application/use-cases/get-user-addresses.usecase';
import { FieldInvalid } from '@modules/user/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
  HttpUpdatedResponse,
  HttpDeletedResponse,
} from '@modules/user/domain/ports/primary/http/sucess.port';
import { defaultRoles } from '@modules/user/domain/types/permissions';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/username/username-constants';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { IDValidator } from '@modules/user/domain/values-objects/uuid/id-validator';
import IDVO from '@modules/user/domain/values-objects/uuid/id-vo';
import { AddressMapper } from '@modules/user/infrastructure/mappers/address.mapper';
import { HttpStatus } from '@nestjs/common';
import { AddressController } from './address.controller';

describe('AddressController', () => {
  let controller: AddressController;

  let addressMapper: AddressMapper;

  let addUserAddressUseCase: AddUserAddressUseCase;
  let getUserAddressUseCase: GetUserAddressUseCase;
  let deleteUserAddressUseCase: DeleteUserAddressUseCase;

  beforeEach(async () => {
    addressMapper = {
      addUserAddressDTOForEntity: jest.fn(),
      addressForEntity: jest.fn(),
    } as any;
    addUserAddressUseCase = { execute: jest.fn() } as any;
    getUserAddressUseCase = { execute: jest.fn() } as any;
    deleteUserAddressUseCase = { execute: jest.fn() } as any;

    controller = new AddressController(
      addressMapper,
      addUserAddressUseCase,
      getUserAddressUseCase,
      deleteUserAddressUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(addressMapper).toBeDefined();
    expect(addUserAddressUseCase).toBeDefined();
    expect(getUserAddressUseCase).toBeDefined();
    expect(deleteUserAddressUseCase).toBeDefined();
  });

  describe('POST /', () => {
    const id = IDConstants.EXEMPLE;
    const dto = mockCreateUserDTO();
    const user = mockCreatedUserDTOToUser(dto, { userId: id });

    beforeEach(() => {
      jest.spyOn(addUserAddressUseCase, 'execute').mockReturnValue(undefined);
      jest
        .spyOn(userMapper, 'addUserAddressDTOForEntity')
        .mockReturnValue(user);
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

      await expect(controller.create(dto)).rejects.toThrow(
        new Error('Erro no use case'),
      );
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

  describe('DELETE /', () => {
    const id = IDConstants.EXEMPLE;

    jest.mock('@user/domain/values-objects/uuid/id-validator');

    beforeEach(() => {
      jest.spyOn(deleteUserUseCase, 'execute').mockResolvedValue(undefined);
      jest.spyOn(IDValidator, 'validate').mockImplementation(jest.fn());
    });

    it('should call deleteUserUseCase.execute with user id', async () => {
      await controller.delete(id);

      expect(deleteUserUseCase.execute).toHaveBeenCalledWith(id);
    });

    it('should return HttpDeletedResponse on success', async () => {
      const response = await controller.delete(id);

      expect(response).toBeInstanceOf(HttpDeletedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Usuário deletado com sucesso',
        data: undefined,
      });
    });

    it('should throw error if id validator throw error', async () => {
      jest.spyOn(IDValidator, 'validate').mockImplementation(() => {
        throw new Error('Erro no id validator');
      });

      await expect(controller.delete(id)).rejects.toThrow(
        new Error('Erro no id validator'),
      );
    });

    it('should throw error if use case throw error', async () => {
      jest
        .spyOn(deleteUserUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.delete(id)).rejects.toThrow(
        new Error('Erro no use case'),
      );
    });
  });
});
