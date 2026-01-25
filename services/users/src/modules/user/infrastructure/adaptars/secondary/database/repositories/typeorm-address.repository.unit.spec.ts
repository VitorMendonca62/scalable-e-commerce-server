vi.mock('../models/address.model', () => ({
  default: class AddressModel {},
}));

import { Repository } from 'typeorm';
import AddressModel from '../models/address.model';
import TypeOrmAddressRepository from './typeorm-address.repository';
import { AddressFactory } from '@modules/user/infrastructure/helpers/address/factory';

describe('TypeOrmAddressRepository', () => {
  let repository: TypeOrmAddressRepository;
  let addressRepository: Repository<AddressModel>;

  beforeEach(() => {
    addressRepository = {
      save: vi.fn(),
      findBy: vi.fn(),
      delete: vi.fn(),
    } as any;

    repository = new TypeOrmAddressRepository(addressRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(addressRepository).toBeDefined();
  });

  describe('addAddress', () => {
    const address = AddressFactory.createModel();

    it('should call save with correct parameters', async () => {
      await repository.addAddress(address);

      expect(addressRepository.save).toHaveBeenCalledWith(address);
    });
  });

  describe('getAll', () => {
    const userID = 'user-123';
    const addresses: AddressModel[] = [
      AddressFactory.createModel({ id: 1, userID: 'id.id' }),
      AddressFactory.createModel({ id: 2 }),
    ];

    it('should call findBy with correct parameters', async () => {
      vi.spyOn(addressRepository, 'findBy').mockResolvedValue(addresses);

      await repository.getAll(userID);

      expect(addressRepository.findBy).toHaveBeenCalledWith({ userID });
    });

    it('should return all addresses for the user', async () => {
      vi.spyOn(addressRepository, 'findBy').mockResolvedValue(addresses);

      const result = await repository.getAll(userID);

      expect(result).toEqual(addresses);
    });
  });

  describe('countAddresses', () => {
    const userID = 'user-123';
    const addresses: AddressModel[] = [
      AddressFactory.createModel({ id: 1, userID: 'id.id' }),
      AddressFactory.createModel({ id: 2 }),
    ];

    it('should call findBy with correct parameters', async () => {
      vi.spyOn(addressRepository, 'findBy').mockResolvedValue(addresses);

      await repository.countAddresses(userID);

      expect(addressRepository.findBy).toHaveBeenCalledWith({ userID });
    });

    it('should return the correct count of addresses', async () => {
      vi.spyOn(addressRepository, 'findBy').mockResolvedValue(addresses);

      const result = await repository.countAddresses(userID);

      expect(result).toBe(2);
    });

    it('should return zero when user has no addresses', async () => {
      vi.spyOn(addressRepository, 'findBy').mockResolvedValue([]);

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
