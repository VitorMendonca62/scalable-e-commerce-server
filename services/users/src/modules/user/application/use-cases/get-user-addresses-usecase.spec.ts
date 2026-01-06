import { NotFoundItem } from '@modules/user/domain/ports/primary/http/error.port';
import { AddressRepositoy } from '@modules/user/domain/ports/secondary/address-repository.port';
import { UserRepository } from '@modules/user/domain/ports/secondary/user-repository.port';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { AddressFactory } from '@modules/user/infrastructure/helpers/address/address-factory';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/user-factory';
import { GetUserAddressUseCase } from './get-user-addresses.usecase';

describe('GetUserAddressUseCase', () => {
  let useCase: GetUserAddressUseCase;
  let addressRepository: AddressRepositoy;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    } as any;

    addressRepository = {
      getAll: jest.fn(),
    } as any;

    useCase = new GetUserAddressUseCase(addressRepository, userRepository);
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
    });

    it('should return the addresses on sucess', async () => {
      const response = await useCase.execute(userID);

      expect(response).toHaveLength(1);
      expect(response).toEqual([
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
      ]);
    });

    it('should return the addresses on sucess when user have 3 addresses', async () => {
      const addresses = [
        AddressFactory.createEntity({ id: 0 }),
        AddressFactory.createEntity({ id: 1 }),
        AddressFactory.createEntity({ id: 2 }),
      ];
      jest.spyOn(addressRepository, 'getAll').mockResolvedValue(addresses);

      const response = await useCase.execute(userID);

      expect(response).toHaveLength(3);
      expect(response).toEqual([
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
        {
          id: 1,
          city: addresses[1].city,
          complement: addresses[1].complement,
          country: addresses[1].country,
          neighborhood: addresses[1].neighborhood,
          number: addresses[1].number,
          postalCode: addresses[1].postalCode,
          state: addresses[1].state,
          street: addresses[1].street,
        },
        {
          id: 2,
          city: addresses[2].city,
          complement: addresses[2].complement,
          country: addresses[2].country,
          neighborhood: addresses[2].neighborhood,
          number: addresses[2].number,
          postalCode: addresses[2].postalCode,
          state: addresses[2].state,
          street: addresses[2].street,
        },
      ]);
    });

    it('should call userRepository with correct parameters ', async () => {
      await useCase.execute(userID);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userId: userID,
      });
    });

    it('should throw NotFoundItem when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(userID)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should throw NotFoundItem when user is not active', async () => {
      const user = UserFactory.createEntity({ active: false });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(useCase.execute(userID)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should call userRepository with correct parameters ', async () => {
      await useCase.execute(userID);

      expect(addressRepository.getAll).toHaveBeenCalledWith(userID);
    });

    it('should throw NotFoundItem when no have addresses ', async () => {
      jest.spyOn(addressRepository, 'getAll').mockResolvedValue([]);

      await expect(useCase.execute(userID)).rejects.toThrow(
        new NotFoundItem('Não foi possível encontrar os endereços do usuário.'),
      );
    });
  });
});
