import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import { IDConstants } from '@modules/user/domain/values-objects/common/constants';
import { AddressFactory } from '@modules/user/infrastructure/helpers/address/factory';
import { GetUserAddressesUseCase } from './get-user-addresses.usecase';
import AddressRepository from '@modules/user/domain/ports/secondary/address-repository.port';

describe('GetUserAddressUseCase', () => {
  let useCase: GetUserAddressesUseCase;
  let addressRepository: AddressRepository;

  beforeEach(async () => {
    addressRepository = {
      getAll: vi.fn(),
    } as any;

    useCase = new GetUserAddressesUseCase(addressRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(addressRepository).toBeDefined();
  });

  describe('execute', () => {
    const userID = IDConstants.EXEMPLE;
    const addresses = [AddressFactory.createModel({ id: 1 })];

    beforeEach(() => {
      vi.spyOn(addressRepository, 'getAll').mockResolvedValue(addresses);
    });

    it('should call addressRepository.getAll with correct parameters', async () => {
      await useCase.execute(userID);
      expect(addressRepository.getAll).toHaveBeenCalledWith(userID);
    });

    it('should return ok and addresses on sucess', async () => {
      const result = await useCase.execute(userID);
      expect(result).toEqual({
        ok: true,
        result: [
          {
            id: 0,
            city: addresses[0].city,
            complement: addresses[0].complement,
            country: addresses[0].country,
            neighborhood: addresses[0].neighborhood,
            number: addresses[0].number,
            postalCode: addresses[0].postalCode,
            state: addresses[0].state,
            street: addresses[0].street,
          },
        ],
      });
    });

    it('should return NOT_FOUND if user address length is 0', async () => {
      vi.spyOn(addressRepository, 'getAll').mockResolvedValue([]);

      const result = await useCase.execute(userID);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível encontrar os endereços do usuário.',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should rethrow error if addressRepository.getAll throw error', async () => {
      vi.spyOn(addressRepository, 'getAll').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await useCase.execute(userID);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
