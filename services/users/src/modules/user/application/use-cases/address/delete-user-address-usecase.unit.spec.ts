import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import { AddressFactory } from '@modules/user/infrastructure/helpers/address/factory';
import { DeleteUserAddressUseCase } from './delete-user-address.usecase';
import AddressRepository from '@modules/user/domain/ports/secondary/address-repository.port';
import { IDConstants } from '@modules/user/domain/values-objects/common/constants';

describe('DeleteUserAddressUseCase', () => {
  let useCase: DeleteUserAddressUseCase;
  let addressRepository: AddressRepository;

  beforeEach(async () => {
    addressRepository = {
      getAll: vi.fn(),
      delete: vi.fn(),
    } as any;

    useCase = new DeleteUserAddressUseCase(addressRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(addressRepository).toBeDefined();
  });

  describe('execute', () => {
    const userID = IDConstants.EXEMPLE;
    const addressIndex = 0;
    const addresses = [AddressFactory.createModel({ id: 1 })];

    beforeEach(() => {
      vi.spyOn(addressRepository, 'getAll').mockResolvedValue(addresses);
      vi.spyOn(addressRepository, 'delete').mockResolvedValue(undefined);
    });

    it('should call addressRepository.getAll with correct parameters', async () => {
      await useCase.execute(addressIndex, userID);
      expect(addressRepository.getAll).toHaveBeenCalledWith(userID);
    });

    it('should call addressRepository.delete with correct parameters', async () => {
      await useCase.execute(addressIndex, userID);
      expect(addressRepository.delete).toHaveBeenCalledWith(
        addresses[addressIndex].id,
      );
    });

    it('should return ok on sucess', async () => {
      const result = await useCase.execute(addressIndex, userID);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND if addressindex is greater than user addresses length', async () => {
      const result = await useCase.execute(5, userID);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel encontrar o endereço',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should rethrow error if addressRepository.getAll throw error', async () => {
      vi.spyOn(addressRepository, 'getAll').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await useCase.execute(addressIndex, userID);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });

    it('should rethrow error if addressRepository.delete throw error', async () => {
      vi.spyOn(addressRepository, 'delete').mockRejectedValue(
        new Error('Error'),
      );

      try {
        await useCase.execute(addressIndex, userID);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
