import { AddressRepositoy } from '@modules/user/domain/ports/secondary/address-repository.port';
import { UserRepository } from '@modules/user/domain/ports/secondary/user-repository.port';
import { DeleteUserAddressUseCase } from './delete-user-address.usecase';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/user-factory';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { AddressFactory } from '@modules/user/infrastructure/helpers/address/address-factory';
import { NotFoundItem } from '@modules/user/domain/ports/primary/http/error.port';

describe('DeleteUserAddressUseCase', () => {
  let useCase: DeleteUserAddressUseCase;
  let addressRepository: AddressRepositoy;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    } as any;

    addressRepository = {
      getAll: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new DeleteUserAddressUseCase(addressRepository, userRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(addressRepository).toBeDefined();
  });

  describe('execute', () => {
    const user = UserFactory.createEntity();
    const userID = IDConstants.EXEMPLE;
    const addresses = [AddressFactory.createEntity({ id: 1 })];

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(addressRepository, 'getAll').mockResolvedValue(addresses);
      jest.spyOn(addressRepository, 'delete').mockResolvedValue(undefined);
    });

    it('should return undefined on sucess', async () => {
      const response = await useCase.execute(0, userID);

      expect(response).toBeUndefined();
    });

    it('should call userRepository with correct parameters ', async () => {
      await useCase.execute(0, userID);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userId: userID,
      });
    });

    it('should throw NotFoundItem when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(0, userID)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should throw NotFoundItem when user is not active', async () => {
      const user = UserFactory.createEntity({ active: false });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(useCase.execute(0, userID)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should call userRepository with correct parameters ', async () => {
      await useCase.execute(0, userID);

      expect(addressRepository.getAll).toHaveBeenCalledWith(userID);
      expect(addressRepository.delete).toHaveBeenCalledWith(userID, 0);
    });

    it('should throw NotFoundItem when when the address index is greater than the user address quantity ', async () => {
      jest
        .spyOn(addressRepository, 'getAll')
        .mockResolvedValue([
          AddressFactory.createEntity({ id: 0 }),
          AddressFactory.createEntity({ id: 1 }),
        ]);

      await expect(useCase.execute(3, userID)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o endereço'),
      );
    });
  });
});
