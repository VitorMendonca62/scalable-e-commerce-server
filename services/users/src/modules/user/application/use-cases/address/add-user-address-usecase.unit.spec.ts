import { AddressFactory } from '@modules/user/infrastructure/helpers/address/factory';
import { AddressMapper } from '@modules/user/infrastructure/mappers/address.mapper';
import { AddUserAddressUseCase } from './add-user-address.usecase';
import AddressRepository from '@modules/user/domain/ports/secondary/address-repository.port';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

describe('AddUserAddressUseCase', () => {
  let useCase: AddUserAddressUseCase;
  let addressRepositoy: AddressRepository;
  let addressMapper: AddressMapper;

  beforeEach(async () => {
    addressRepositoy = {
      countAddresses: vi.fn(),
      addAddress: vi.fn(),
    } as any;

    addressMapper = {
      entityForModel: vi.fn(),
    } as any;

    useCase = new AddUserAddressUseCase(addressRepositoy, addressMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(addressRepositoy).toBeDefined();
    expect(addressMapper).toBeDefined();
  });

  describe('execute', () => {
    const newAddress = AddressFactory.createEntity();
    const addressModel = AddressFactory.createModel();

    beforeEach(() => {
      vi.spyOn(addressRepositoy, 'countAddresses').mockResolvedValue(2);
      vi.spyOn(addressMapper, 'entityForModel').mockReturnValue(addressModel);
    });

    it('should call addressRepositoy.countAddresses with correct parameters', async () => {
      await useCase.execute(newAddress);
      expect(addressRepositoy.countAddresses).toHaveBeenCalledWith(
        newAddress.userID.getValue(),
      );
    });

    it('should call addressMapper.entityForModel with correct parameters', async () => {
      await useCase.execute(newAddress);

      expect(addressMapper.entityForModel).toHaveBeenCalledWith(newAddress);
    });

    it('should call addressRepositoy.addAddress with correct parameters', async () => {
      await useCase.execute(newAddress);

      expect(addressRepositoy.addAddress).toHaveBeenCalledWith(
        newAddress.userID.getValue(),
        addressModel,
      );
    });

    it('should return ok on sucess', async () => {
      const result = await useCase.execute(newAddress);
      expect(result).toEqual({ ok: true });
    });

    it('should return BUSINESS_RULE_FAILURE if user address length is greater than 3', async () => {
      vi.spyOn(addressRepositoy, 'countAddresses').mockResolvedValue(4);

      const result = await useCase.execute(newAddress);
      expect(result).toEqual({
        ok: false,
        message:
          'O usuário já possui o número máximo de endereços permitidos (3).',
        reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
      });
    });

    it('should rethrow error if addressRepositoy.countAddresses throw error', async () => {
      vi.spyOn(addressRepositoy, 'countAddresses').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await useCase.execute(newAddress);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });

    it('should return NOT_POSSIBLE error if addressRepositoy.addAddress throw error', async () => {
      vi.spyOn(addressRepositoy, 'addAddress').mockRejectedValue(
        new Error('Error'),
      );

      const result = await useCase.execute(newAddress);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel adicionar o endereço',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should rethrow error if addressMapper.entityForModel throw error', async () => {
      vi.spyOn(addressRepositoy, 'countAddresses').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await useCase.execute(newAddress);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
