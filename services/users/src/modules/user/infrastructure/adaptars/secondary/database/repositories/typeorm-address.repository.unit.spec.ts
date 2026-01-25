vi.mock('../models/address.model', () => ({
  default: class AddressModel {},
}));

import { Repository } from 'typeorm';
import AddressModel from '../models/address.model';
import TypeOrmAddressRepository from './typeorm-address.repository';
import { AddressFactory } from '@modules/user/infrastructure/helpers/address/factory';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/factory';
import { IDConstants } from '@modules/user/domain/values-objects/common/constants';

describe('TypeOrmAddressRepository', () => {
  let repository: TypeOrmAddressRepository;
  let addressRepository: Repository<AddressModel>;

  beforeEach(() => {
    addressRepository = {
      save: vi.fn(),
      create: vi.fn(),
      find: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    } as any;

    repository = new TypeOrmAddressRepository(addressRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(addressRepository).toBeDefined();
  });

  describe('addAddress', () => {
    const address = AddressFactory.createModel({ user: undefined });
    const userID = IDConstants.EXEMPLE;

    it('should call create with correct parameters', async () => {
      await repository.addAddress(userID, address);

      expect(addressRepository.create).toHaveBeenCalledWith({
        ...address,
        user: { userID },
      });
    });

    it('should call save with correct parameters', async () => {
      const addressCreated = AddressFactory.createModel();

      vi.spyOn(addressRepository, 'create').mockReturnValue(addressCreated);
      await repository.addAddress(userID, address);

      expect(addressRepository.save).toHaveBeenCalledWith(addressCreated);
    });
  });

  describe('getAll', () => {
    const userID = 'user-123';
    const addresses: AddressModel[] = [
      AddressFactory.createModel({
        id: 1,
        user: { id: 132, ...UserFactory.createModel() },
      }),
      AddressFactory.createModel({ id: 2 }),
    ];

    it('should call find with correct parameters', async () => {
      vi.spyOn(addressRepository, 'find').mockResolvedValue(addresses);

      await repository.getAll(userID);

      expect(addressRepository.find).toHaveBeenCalledWith({
        where: {
          user: {
            userID: userID,
          },
        },
        order: { createdAt: 'ASC' },
      });
    });

    it('should return all addresses for the user', async () => {
      vi.spyOn(addressRepository, 'find').mockResolvedValue(addresses);

      const result = await repository.getAll(userID);

      expect(result).toEqual(addresses);
    });
  });

  describe('countAddresses', () => {
    const userID = 'user-123';

    it('should call count with correct parameters', async () => {
      vi.spyOn(addressRepository, 'count').mockResolvedValue(2);

      await repository.countAddresses(userID);

      expect(addressRepository.count).toHaveBeenCalledWith({
        where: {
          user: {
            userID,
          },
        },
      });
    });

    it('should return the correct count of addresses', async () => {
      vi.spyOn(addressRepository, 'count').mockResolvedValue(4);

      const result = await repository.countAddresses(userID);

      expect(result).toBe(4);
    });

    it('should return zero when user has no addresses', async () => {
      vi.spyOn(addressRepository, 'count').mockResolvedValue(0);

      const result = await repository.countAddresses(userID);

      expect(result).toBe(0);
    });
  });

  describe('delete', () => {
    const addressIndex = 42;

    it('should call delete with correct parameters', async () => {
      await repository.delete(addressIndex);

      expect(addressRepository.delete).toHaveBeenCalledWith({
        id: addressIndex,
      });
    });
  });
});
