import { UserRepository } from '@modules/user/domain/ports/secondary/user-repository.port';
import { AddUserAddressUseCase } from './add-user-address.usecase';
import { AddressRepositoy } from '@modules/user/domain/ports/secondary/address-repository.port';
import { AddressService } from '@modules/user/infrastructure/adaptars/secondary/address/address.service';
import { AddressMapper } from '@modules/user/infrastructure/mappers/address.mapper';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/user-factory';
import { AddressFactory } from '@modules/user/infrastructure/helpers/address/address-factory';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import {
  BusinessRuleViolation,
  ExternalServiceError,
  FieldInvalid,
  NotFoundItem,
} from '@modules/user/domain/ports/primary/http/error.port';
import { AddressServiceFactory } from '@modules/user/infrastructure/helpers/address/address-service-factory';
import { HttpStatus } from '@nestjs/common';

describe('AddUserAddressUseCase', () => {
  let useCase: AddUserAddressUseCase;
  let userRepository: UserRepository;
  let addressRepositoy: AddressRepositoy;
  let addressService: AddressService;
  let addressMapper: AddressMapper;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    } as any;

    addressRepositoy = {
      getAll: jest.fn(),
      addAddress: jest.fn(),
    } as any;

    addressService = {
      searchCEP: jest.fn(),
    } as any;

    addressMapper = {
      addressModelForEntity: jest.fn(),
    } as any;

    useCase = new AddUserAddressUseCase(
      userRepository,
      addressRepositoy,
      addressService,
      addressMapper,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(addressRepositoy).toBeDefined();
    expect(addressService).toBeDefined();
    expect(addressMapper).toBeDefined();
  });

  describe('execute', () => {
    const user = UserFactory.createEntity();
    const address = IDConstants.EXEMPLE;
    const addresses = [AddressFactory.createEntity({ id: 1 })];
    const newAddress = AddressFactory.createModel({ id: undefined });

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(addressRepositoy, 'getAll').mockResolvedValue(addresses);
      jest
        .spyOn(addressService, 'searchCEP')
        .mockReturnValue(AddressServiceFactory.getSearchApiResponse());
      jest
        .spyOn(addressMapper, 'addressModelForEntity')
        .mockReturnValue(AddressFactory.createEntity({ id: 1 }));
    });

    it('should return undefined on sucess', async () => {
      const response = await useCase.execute(address, newAddress);

      expect(response).toBeUndefined();
    });

    it('should call UserRepository with correct parameters ', async () => {
      await useCase.execute(address, newAddress);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userId: address,
      });
    });

    it('should throw NotFoundItem if not found user ', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(address, newAddress)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should throw NotFoundItem if user is not active ', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(UserFactory.createEntity({ active: false }));

      await expect(useCase.execute(address, newAddress)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should call AddressRepositoy with correct parameters', async () => {
      await useCase.execute(address, newAddress);

      expect(addressRepositoy.getAll).toHaveBeenCalledWith(address);
      expect(addressRepositoy.addAddress).toHaveBeenCalledWith(
        AddressFactory.createEntity({ id: 1 }),
      );
    });

    it('should throw BusinessRuleViolation if user have 3 address', async () => {
      jest
        .spyOn(addressRepositoy, 'getAll')
        .mockResolvedValue([
          AddressFactory.createEntity({ id: 1 }),
          AddressFactory.createEntity({ id: 2 }),
          AddressFactory.createEntity({ id: 3 }),
        ]);

      await expect(useCase.execute(address, newAddress)).rejects.toThrow(
        new BusinessRuleViolation(
          'O usuário já possui o número máximo de endereços permitidos (3).',
        ),
      );
    });

    it('should throw FieldInvalid if searchCEP return BAD_REQUEST', async () => {
      jest.spyOn(addressService, 'searchCEP').mockImplementation(() => {
        throw AddressServiceFactory.getSearchApiErrorResponse(
          'BAD_REQUEST',
          HttpStatus.BAD_REQUEST,
        ) as never;
      });

      await expect(useCase.execute(address, newAddress)).rejects.toThrow(
        new FieldInvalid(
          'Erro na validação do CEP. O mesto deve estar no formato XXXXXXXX',
          'postalCode',
        ),
      );
    });

    it('should throw ExternalServiceError if searchCEP return NOT_FOUND', async () => {
      jest.spyOn(addressService, 'searchCEP').mockImplementation(() => {
        throw AddressServiceFactory.getSearchApiErrorResponse(
          'NOT_FOUND',
          HttpStatus.NOT_FOUND,
        ) as never;
      });

      await expect(useCase.execute(address, newAddress)).rejects.toThrow(
        new ExternalServiceError('O CEP informado não existe.'),
      );
    });

    it('should throw ExternalServiceError if searchCEP return BAD_GATEWAY', async () => {
      jest.spyOn(addressService, 'searchCEP').mockImplementation(() => {
        throw AddressServiceFactory.getSearchApiErrorResponse(
          'BAD_GATEWAY',
          HttpStatus.BAD_GATEWAY,
        ) as never;
      });

      await expect(useCase.execute(address, newAddress)).rejects.toThrow(
        new ExternalServiceError(
          'Serviço de CEP temporariamente indisponível. Tente novamente mais tarde.',
        ),
      );
    });

    it('should throw FieldInvalid if searchCEP return BAD_REQUEST', async () => {
      jest.spyOn(addressService, 'searchCEP').mockImplementation(() => {
        throw AddressServiceFactory.getSearchApiErrorResponse(
          'UNAUTHORIZED',
          HttpStatus.UNAUTHORIZED,
        ) as never;
      });

      await expect(useCase.execute(address, newAddress)).rejects.toThrow(
        new ExternalServiceError(
          'Erro inesperado ao consultar o CEP. Tente novamente mais tarde.',
        ),
      );
    });

    it('should throw error if ValueObject.validateInPostalCode throw error', async () => {
      const valuesValidationsInPostalCode = [
        newAddress.state,
        newAddress.city,
        newAddress.neighborhood,
        newAddress.street,
      ];
      valuesValidationsInPostalCode.forEach(async (value) => {
        jest.spyOn(value, 'validateInPostalCode').mockImplementationOnce(() => {
          throw new Error('Error');
        });

        await expect(useCase.execute(address, newAddress)).rejects.toThrow(
          new Error('Error'),
        );
      });
    });

    it('should call AddressMapper with correct parameters', async () => {
      await useCase.execute(address, newAddress);

      expect(addressMapper.addressModelForEntity).toHaveBeenCalledWith(
        newAddress,
      );
    });
  });
});
