import {
  AddUserAddressUseCase,
  DeleteUserAddressUseCase,
  GetUserAddressesUseCase,
} from '@modules/user/application/use-cases/address/use-cases';
import {
  BusinessRuleFailure,
  NotFoundItem,
} from '@modules/user/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@modules/user/domain/ports/primary/http/sucess.port';
import { IDConstants } from '@modules/user/domain/values-objects/common/constants';
import {
  AddressDTOFactory,
  AddressFactory,
} from '@modules/user/infrastructure/helpers/address/factory';
import { AddressMapper } from '@modules/user/infrastructure/mappers/address.mapper';
import { HttpStatus } from '@nestjs/common';
import { AddressController } from './address.controller';
import { FastifyReply } from 'fastify';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

describe('AddressController', () => {
  let controller: AddressController;

  let addressMapper: AddressMapper;

  let addUserAddressUseCase: AddUserAddressUseCase;
  let getUserAddressesUseCase: GetUserAddressesUseCase;
  let deleteUserAddressUseCase: DeleteUserAddressUseCase;

  let response: FastifyReply;

  beforeEach(async () => {
    addressMapper = {
      addUserAddressDTOForEntity: vi.fn(),
      addressModelForEntity: vi.fn(),
    } as any;

    addUserAddressUseCase = { execute: vi.fn() } as any;
    getUserAddressesUseCase = { execute: vi.fn() } as any;
    deleteUserAddressUseCase = { execute: vi.fn() } as any;

    controller = new AddressController(
      addressMapper,
      addUserAddressUseCase,
      getUserAddressesUseCase,
      deleteUserAddressUseCase,
    );

    response = {
      redirect: vi.fn().mockReturnValue(response),
      status: vi.fn().mockReturnValue(response),
    } as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(addressMapper).toBeDefined();
    expect(addUserAddressUseCase).toBeDefined();
    expect(getUserAddressesUseCase).toBeDefined();
    expect(deleteUserAddressUseCase).toBeDefined();
  });

  describe('addAddress', () => {
    const dto = AddressDTOFactory.createAddUserAddressDTO();
    const addressEntity = AddressFactory.createEntity();
    const userID = IDConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(addressMapper, 'addUserAddressDTOForEntity').mockReturnValue(
        addressEntity,
      );
      vi.spyOn(addUserAddressUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
    });

    it('should call addressMapper.addUserAddressDTOForEntity with correct parameters', async () => {
      await controller.addAddress(dto, userID, response);

      expect(addressMapper.addUserAddressDTOForEntity).toHaveBeenCalledWith(
        dto,
        userID,
      );
    });

    it('should call addUserAddressUseCase.execute with correct parameters', async () => {
      await controller.addAddress(dto, userID, response);

      expect(addUserAddressUseCase.execute).toHaveBeenCalledWith(addressEntity);
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.addAddress(dto, userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.CREATED);
      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Endereço criado com sucesso',
        data: undefined,
      });
    });

    it('should return BusinessRuleFailure if use case result is not ok and reason is BUSINESS_RULE_FAILURE', async () => {
      vi.spyOn(addUserAddressUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any',
        reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
      });

      const result = await controller.addAddress(dto, userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(BusinessRuleFailure);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'any',
        data: undefined,
      });
    });

    it('should return BusinessRuleFailure if use case result is not ok and reason is NOT_POSSIBLE', async () => {
      vi.spyOn(addUserAddressUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });

      const result = await controller.addAddress(dto, userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(BusinessRuleFailure);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'any',
        data: undefined,
      });
    });

    it('should rethrow error if usecase throw error', async () => {
      vi.spyOn(addUserAddressUseCase, 'execute').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await controller.addAddress(dto, userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('getAll', () => {
    const userID = IDConstants.EXEMPLE;
    const addresses = [AddressFactory.createModel({ id: 1 })];
    const addressReturn = {
      id: 0,
      city: addresses[0].city,
      complement: addresses[0].complement,
      country: addresses[0].country,
      neighborhood: addresses[0].neighborhood,
      number: addresses[0].number,
      postalCode: addresses[0].postalCode,
      state: addresses[0].state,
      street: addresses[0].street,
    };
    beforeEach(() => {
      vi.spyOn(getUserAddressesUseCase, 'execute').mockResolvedValue({
        ok: true,
        result: [addressReturn],
      });
    });

    it('should call getUserAddressesUseCase.getAll with correct parameters', async () => {
      await controller.getAll(userID, response);

      expect(getUserAddressesUseCase.execute).toHaveBeenCalledWith(userID);
    });

    it('should return HttpOKResponse with addresses on success', async () => {
      const result = await controller.getAll(userID, response);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Aqui está todos os endereços do usuário',
        data: [addressReturn],
      });
    });

    it('should return NotFoundItem if use case result is not ok', async () => {
      vi.spyOn(getUserAddressesUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any',
        reason: ApplicationResultReasons.NOT_FOUND,
      });

      const result = await controller.getAll(userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'any',
        data: undefined,
      });
    });

    it('should rethrow error if usecase throw error', async () => {
      vi.spyOn(getUserAddressesUseCase, 'execute').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await controller.getAll(userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('delete', () => {
    const userID = IDConstants.EXEMPLE;
    const addressID = 0;

    beforeEach(() => {
      vi.spyOn(deleteUserAddressUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
    });

    it('should call deleteUserAddressUseCase.execute with correct parameters', async () => {
      await controller.delete(addressID, userID, response);

      expect(deleteUserAddressUseCase.execute).toHaveBeenCalledWith(
        addressID,
        userID,
      );
    });

    it('should return HttpOKResponse with addresses on success', async () => {
      const result = await controller.delete(addressID, userID, response);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Endereço deletado com sucesso',
        data: undefined,
      });
    });

    it('should return NotFoundItem if use case result is not ok', async () => {
      vi.spyOn(deleteUserAddressUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'any',
        reason: ApplicationResultReasons.NOT_FOUND,
      });

      const result = await controller.delete(addressID, userID, response);

      expect(response.status).toBeCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'any',
        data: undefined,
      });
    });

    it('should rethrow error if usecase throw error', async () => {
      vi.spyOn(deleteUserAddressUseCase, 'execute').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await controller.delete(addressID, userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
