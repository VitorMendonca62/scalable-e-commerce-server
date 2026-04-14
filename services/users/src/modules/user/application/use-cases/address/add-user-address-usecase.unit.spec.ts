import { AddressFactory } from '@user/infrastructure/helpers/address/factory';
import { AddressMapper } from '@user/infrastructure/mappers/address.mapper';
import { AddUserAddressUseCase } from './add-user-address.usecase';
import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

describe('AddUserAddressUseCase', () => {
  let useCase: AddUserAddressUseCase;
  let addressRepository: AddressRepository;
  let addressMapper: AddressMapper;

  beforeEach(async () => {
    addressRepository = {
      countAddresses: vi.fn(),
      addAddress: vi.fn(),
    } as any;

    addressMapper = {
      entityForModel: vi.fn(),
    } as any;

    useCase = new AddUserAddressUseCase(addressRepository, addressMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(addressRepository).toBeDefined();
    expect(addressMapper).toBeDefined();
  });

  describe('execute', () => {
    const newAddress = AddressFactory.createEntity();
    const addressModel = AddressFactory.createRecord();

    beforeEach(() => {
      vi.spyOn(addressMapper, 'entityForModel').mockReturnValue(addressModel);
    });

    it('should call addressRepositoy.countAddresses with correct parameters', async () => {
      await useCase.execute(newAddress);
    });

    it('should call addressMapper.entityForModel with correct parameters', async () => {
      await useCase.execute(newAddress);

      expect(addressMapper.entityForModel).toHaveBeenCalledWith(newAddress);
    });

    it('should call addressRepositoy.addAddress with correct parameters', async () => {
      await useCase.execute(newAddress);

      expect(addressRepository.addAddress).toHaveBeenCalledWith(
        newAddress.userID.getValue(),
        addressModel,
      );
    });

    it('should return ok on sucess', async () => {
      const result = await useCase.execute(newAddress);
      expect(result).toEqual({ ok: true });
    });

    it('should return BUSINESS_RULE_FAILURE if user address length is greater than 3', async () => {
      vi.spyOn(addressRepository, 'addAddress').mockRejectedValue(
        new Error('max_addresses_per_user'),
      );

      const result = await useCase.execute(newAddress);
      expect(result).toEqual({
        ok: false,
        message:
          'O usuário já possui o número máximo de endereços permitidos (3).',
        reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
      });
    });

    it('should return NOT_POSSIBLE error if addressRepository.addAddress throw not max_addresses_per_user error', async () => {
      vi.spyOn(addressRepository, 'addAddress').mockRejectedValue(
        new Error('Error'),
      );

      const result = await useCase.execute(newAddress);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel adicionar o endereço',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE if addressMapper.entityForModel throw error', async () => {
      vi.spyOn(addressMapper, 'entityForModel').mockImplementation(() => {
        throw new Error('Error');
      });

      const result = await useCase.execute(newAddress);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel adicionar o endereço',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });

  describe('isAddressLimitError', () => {
    it('returns true for max_addresses_per_user', () => {
      const result = (useCase as any).isAddressLimitError(
        new Error('max_addresses_per_user'),
      );
      expect(result).toBe(true);
    });

    it('returns false for other errors', () => {
      const result = (useCase as any).isAddressLimitError(
        new Error('another error'),
      );
      expect(result).toBe(false);
    });

    it('returns false for non-error input', () => {
      const result = (useCase as any).isAddressLimitError(null);
      expect(result).toBe(false);
    });
  });
});
