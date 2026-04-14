vi.mock('../models/address.model', () => ({
  default: class AddressModel {},
}));

import { Repository } from 'typeorm';
import AddressModel from '../models/address.model';
import TypeOrmAddressRepository from './typeorm-address.repository';
import { AddressFactory } from '@user/infrastructure/helpers/address/factory';
import { IDConstants } from '@user/domain/values-objects/common/constants';

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
      manager: {
        transaction: vi.fn(),
      },
    } as any;

    repository = new TypeOrmAddressRepository(addressRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
    expect(addressRepository).toBeDefined();
  });

  describe('addAddress', () => {
    const address = AddressFactory.createRecord();
    const userID = IDConstants.EXEMPLE;

    const buildManager = (countValue: number, created: AddressModel) => {
      const query = vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: countValue }]);

      const create = vi.fn().mockReturnValue(created);
      const save = vi.fn().mockResolvedValue(created);

      return { query, create, save };
    };

    it('should call manager.create with correct parameters', async () => {
      const addressCreated = AddressFactory.createModel();
      const manager = buildManager(0, addressCreated);

      vi.spyOn(addressRepository.manager, 'transaction').mockImplementation(
        async (...args: any[]) => {
          const work = typeof args[0] === 'function' ? args[0] : args[1];
          await work(manager);
        },
      );

      await repository.addAddress(userID, address);

      expect(manager.query).toHaveBeenCalledWith(
        'SELECT 1 FROM "users" WHERE "user_id" = $1 FOR UPDATE',
        [userID],
      );
      expect(manager.query).toHaveBeenCalledWith(
        'SELECT COUNT(*)::int AS count FROM "addresses" WHERE "user_id" = $1',
        [userID],
      );
      expect(manager.create).toHaveBeenCalledWith(AddressModel, {
        ...address,
        user: { userID },
      });
    });

    it('should call manager.save with correct parameters', async () => {
      const addressCreated = AddressFactory.createModel();
      const manager = buildManager(0, addressCreated);

      vi.spyOn(addressRepository.manager, 'transaction').mockImplementation(
        async (...args: any[]) => {
          const work = typeof args[0] === 'function' ? args[0] : args[1];
          await work(manager);
        },
      );

      await repository.addAddress(userID, address);

      expect(manager.save).toHaveBeenCalledWith(addressCreated);
    });

    it('should throw when address limit is reached', async () => {
      const addressCreated = AddressFactory.createModel();
      const manager = buildManager(3, addressCreated);

      vi.spyOn(addressRepository.manager, 'transaction').mockImplementation(
        async (...args: any[]) => {
          const work = typeof args[0] === 'function' ? args[0] : args[1];
          await work(manager);
        },
      );

      await expect(repository.addAddress(userID, address)).rejects.toThrow(
        'max_addresses_per_user',
      );
      expect(manager.create).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    const userID = IDConstants.EXEMPLE;
    const addresses: AddressModel[] = [
      AddressFactory.createModel({
        id: 1,
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
        select: [
          'id',
          'street',
          'number',
          'complement',
          'neighborhood',
          'city',
          'postalCode',
          'state',
          'country',
          'createdAt',
          'userID',
        ],
        order: { createdAt: 'ASC' },
      });
    });

    it('should return all addresses for the user', async () => {
      vi.spyOn(addressRepository, 'find').mockResolvedValue(addresses);

      const result = await repository.getAll(userID);

      expect(result).toEqual(
        addresses.map((address) => ({
          id: address.id,
          userID,
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          postalCode: address.postalCode,
          state: address.state,
          country: address.country,
          createdAt: address.createdAt,
        })),
      );
    });
  });

  describe('delete', () => {
    const addressId = 42;
    const userID = IDConstants.EXEMPLE;

    it('should call delete with correct parameters', async () => {
      vi.spyOn(addressRepository, 'delete').mockResolvedValue({
        affected: 1,
      } as any);
      await repository.delete(addressId, userID);

      expect(addressRepository.delete).toHaveBeenCalledWith({
        id: addressId,
        userID,
      });
    });

    it('should return affected rows if more than 1', async () => {
      vi.spyOn(addressRepository, 'delete').mockResolvedValue({
        affected: 1,
      } as any);

      const result = await repository.delete(addressId, userID);

      expect(result).toBe(1);
    });

    it('should return affected rows if is 0', async () => {
      vi.spyOn(addressRepository, 'delete').mockResolvedValue({
        affected: 0,
      } as any);

      const result = await repository.delete(addressId, userID);

      expect(result).toBe(0);
    });
  });
});
