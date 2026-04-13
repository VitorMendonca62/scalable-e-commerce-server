import {
  AddUserAddressUseCase,
  DeleteUserAddressUseCase,
  GetUserAddressesUseCase,
} from '@user/application/use-cases/address/use-cases';
import { NotPossible } from '@user/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@user/domain/ports/primary/http/sucess.port';
import { IDConstants } from '@user/domain/values-objects/common/constants';
import {
  AddressDTOFactory,
  AddressFactory,
} from '@user/infrastructure/helpers/address/factory';
import { AddressMapper } from '@user/infrastructure/mappers/address.mapper';
import { HttpStatus } from '@nestjs/common';
import { AddressController } from './address.controller';
import { FastifyReply } from 'fastify';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';
import UseCaseResultToHttpMapper from '@user/infrastructure/mappers/use-case-result-to-http.mapper';

describe('AddressController', () => {
  let controller: AddressController;

  let addressMapper: AddressMapper;
  let useCaseResultToHttpMapper: UseCaseResultToHttpMapper;

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
    useCaseResultToHttpMapper = {
      map: vi.fn(),
    } as any;

    controller = new AddressController(
      addressMapper,
      useCaseResultToHttpMapper,
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
    expect(useCaseResultToHttpMapper).toBeDefined();
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

    it('should return OK response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpCreatedResponse('Endereço criado com sucesso'),
        );

      const result = await controller.addAddress(dto, userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpCreatedResponse('Endereço criado com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Endereço criado com sucesso',
        data: undefined,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(addUserAddressUseCase, 'execute').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.addAddress(dto, userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpCreatedResponse('Endereço criado com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });

    it('should propagate error when use case throws', async () => {
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
      addressId: addresses[0].id,
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

    it('should return OK response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
        result: [addressReturn],
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(
          new HttpOKResponse('Aqui está todos os endereços do usuário', [
            addressReturn,
          ]),
        );

      const result = await controller.getAll(userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Aqui está todos os endereços do usuário', [
          addressReturn,
        ]),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Aqui está todos os endereços do usuário',
        data: [addressReturn],
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(getUserAddressesUseCase, 'execute').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.getAll(userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Aqui está todos os endereços do usuário', []),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });

    it('should propagate error when use case throws', async () => {
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

    it('should return OK response when use case succeeds', async () => {
      const useCaseResult = {
        ok: true as const,
      };

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new HttpOKResponse('Endereço deletado com sucesso'));

      const result = await controller.delete(addressID, userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Endereço deletado com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Endereço deletado com sucesso',
        data: undefined,
      });
    });

    it('should return NotPossible or other when use case fails', async () => {
      const useCaseResult = {
        ok: false as const,
        message: 'any',
        reason: ApplicationResultReasons.NOT_POSSIBLE as const,
      };

      vi.spyOn(deleteUserAddressUseCase, 'execute').mockResolvedValue(
        useCaseResult,
      );

      const mapperSpy = vi
        .spyOn(useCaseResultToHttpMapper, 'map')
        .mockReturnValue(new NotPossible('any'));

      const result = await controller.delete(addressID, userID, response);

      expect(mapperSpy).toHaveBeenCalledWith(
        useCaseResult,
        new HttpOKResponse('Endereço deletado com sucesso'),
        response,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'any',
        data: undefined,
      });
    });
    it('should propagate error when use case throws', async () => {
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
