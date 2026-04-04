import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';
import { AddressFactory } from '@user/infrastructure/helpers/address/factory';
import { DeleteUserAddressUseCase } from './delete-user-address.usecase';
import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import { IDConstants } from '@user/domain/values-objects/common/constants';

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
    const addressId = 1;
    const addresses = [AddressFactory.createRecord({ id: addressId })];

    beforeEach(() => {
      vi.spyOn(addressRepository, 'getAll').mockResolvedValue(addresses);
      vi.spyOn(addressRepository, 'delete').mockResolvedValue(undefined);
    });

    it('should call addressRepository.getAll with correct parameters', async () => {
      await useCase.execute(addressId, userID);
      expect(addressRepository.getAll).toHaveBeenCalledWith(userID);
    });

    it('should call addressRepository.delete with correct parameters', async () => {
      await useCase.execute(addressId, userID);
      expect(addressRepository.delete).toHaveBeenCalledWith(
        addressId,
      );
    });

    it('should return ok on sucess', async () => {
      const result = await useCase.execute(addressId, userID);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND if addressId does not exist for user', async () => {
      const result = await useCase.execute(5, userID);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel encontrar o endereço',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    describe('not possible', () => {
      it('should return NOT_POSSIBLE if addressRepository.getAll throw error', async () => {
        vi.spyOn(addressRepository, 'getAll').mockRejectedValue(
          new Error('Error'),
        );

        const result = await useCase.execute(addressId, userID);
        expect(result).toEqual({
          ok: false,
          message: 'Não foi possivel deletar o endereço',
          reason: ApplicationResultReasons.NOT_POSSIBLE,
        });
      });

      it('should return NOT_POSSIBLE if addressRepository.delete throw error', async () => {
        vi.spyOn(addressRepository, 'delete').mockRejectedValue(
          new Error('Error'),
        );

        const result = await useCase.execute(addressId, userID);
        expect(result).toEqual({
          ok: false,
          message: 'Não foi possivel deletar o endereço',
          reason: ApplicationResultReasons.NOT_POSSIBLE,
        });
      });
    });
  });
});
