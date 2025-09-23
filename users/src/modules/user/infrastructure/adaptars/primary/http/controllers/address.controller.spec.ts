import { AddUserAddressUseCase } from '@modules/user/application/use-cases/add-user-address.usecase';
import { DeleteUserAddressUseCase } from '@modules/user/application/use-cases/delete-user-address.usecase';
import { GetUserAddressUseCase } from '@modules/user/application/use-cases/get-user-addresses.usecase';
import {
  HttpCreatedResponse,
  HttpOKResponse,
  HttpDeletedResponse,
} from '@modules/user/domain/ports/primary/http/sucess.port';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { IDValidator } from '@modules/user/domain/values-objects/uuid/id-validator';
import { AddressMapper } from '@modules/user/infrastructure/mappers/address.mapper';
import { HttpStatus } from '@nestjs/common';
import { AddressController } from './address.controller';
import {
  AddressDTO,
  AddressFactory,
} from '@modules/user/infrastructure/helpers/address/address-factory';

describe('AddressController', () => {
  let controller: AddressController;

  let addressMapper: AddressMapper;

  let addUserAddressUseCase: AddUserAddressUseCase;
  let getUserAddressesUseCase: GetUserAddressUseCase;
  let deleteUserAddressUseCase: DeleteUserAddressUseCase;

  beforeEach(async () => {
    addressMapper = {
      addUserAddressDTOForModel: jest.fn(),
      addressModelForEntity: jest.fn(),
    } as any;
    addUserAddressUseCase = { execute: jest.fn() } as any;
    getUserAddressesUseCase = { execute: jest.fn() } as any;
    deleteUserAddressUseCase = { execute: jest.fn() } as any;

    controller = new AddressController(
      addressMapper,
      addUserAddressUseCase,
      getUserAddressesUseCase,
      deleteUserAddressUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(addressMapper).toBeDefined();
    expect(addUserAddressUseCase).toBeDefined();
    expect(getUserAddressesUseCase).toBeDefined();
    expect(deleteUserAddressUseCase).toBeDefined();
  });

  describe('POST /', () => {
    const userId = IDConstants.EXEMPLE;
    const dto = AddressDTO.createAddUserAddressDTO();
    const address = AddressFactory.createModel();

    beforeEach(() => {
      jest.spyOn(addUserAddressUseCase, 'execute').mockReturnValue(undefined);
      jest
        .spyOn(addressMapper, 'addUserAddressDTOForModel')
        .mockReturnValue(address);
    });

    it('should call addressMapper.addUserAddressDTOForEntity with user id and DTO', async () => {
      await controller.add(dto, userId);

      expect(addressMapper.addUserAddressDTOForModel).toHaveBeenCalledWith(
        dto,
        userId,
      );
    });

    it('should call addUserAddressUseCase.execute with user id and model', async () => {
      await controller.add(dto, userId);

      expect(addUserAddressUseCase.execute).toHaveBeenCalledWith(
        userId,
        address,
      );
    });

    it('should return HttpCreatedResponse on success', async () => {
      const response = await controller.add(dto, userId);

      expect(response).toBeInstanceOf(HttpCreatedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Endereço criado com sucesso',
      });
    });
    it('should throw error if use case throw error', async () => {
      jest
        .spyOn(addUserAddressUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.add(dto, userId)).rejects.toThrow(
        new Error('Erro no use case'),
      );
    });
  });

  describe('GET /', () => {
    const userId = IDConstants.EXEMPLE;
    const addresses = [
      AddressFactory.createEntity({ id: 0 }),
      AddressFactory.createEntity({ id: 1 }),
      AddressFactory.createEntity({ id: 2 }),
    ];

    beforeEach(() => {
      jest
        .spyOn(getUserAddressesUseCase, 'execute')
        .mockResolvedValue(addresses);
    });

    it('should call getUserAddressesUseCase.execute with user Id', async () => {
      await controller.getAll(userId);

      expect(getUserAddressesUseCase.execute).toHaveBeenCalledWith(userId);
    });

    it('should return HttpCreatedResponse on success', async () => {
      const response = await controller.getAll(userId);

      expect(response).toBeInstanceOf(HttpOKResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Aqui está todos os endereços do usuário',
        data: addresses,
      });
    });

    it('should throw error if use case throw error', async () => {
      jest
        .spyOn(getUserAddressesUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.getAll(userId)).rejects.toThrow(
        new Error('Erro no use case'),
      );
    });
  });

  describe('DELETE /:addressId', () => {
    const userId = IDConstants.EXEMPLE;

    beforeEach(() => {
      jest
        .spyOn(deleteUserAddressUseCase, 'execute')
        .mockResolvedValue(undefined);
      jest.spyOn(IDValidator, 'validate').mockImplementation(jest.fn());
    });

    it('should call deleteUserAddressUseCase.execute with user id and address id', async () => {
      await controller.delete(1, userId);

      expect(deleteUserAddressUseCase.execute).toHaveBeenCalledWith(1, userId);
    });

    it('should return HttpDeletedResponse on success', async () => {
      const response = await controller.delete(1, userId);

      expect(response).toBeInstanceOf(HttpDeletedResponse);
      expect(response).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Endereço deletado com sucesso',
        data: undefined,
      });
    });

    it('should throw error if use case throw error', async () => {
      jest
        .spyOn(deleteUserAddressUseCase, 'execute')
        .mockRejectedValue(new Error('Erro no use case'));

      await expect(controller.delete(1, userId)).rejects.toThrow(
        new Error('Erro no use case'),
      );
    });
  });
});
