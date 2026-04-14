import AddressRepository from '@user/domain/ports/secondary/address-repository.port';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import AddressModel from '../models/address.model';
import { AddressRecord } from '@user/domain/types/address-record';

@Injectable()
export default class TypeOrmAddressRepository implements AddressRepository {
  constructor(
    @InjectRepository(AddressModel)
    private addressRepository: Repository<AddressModel>,
  ) {}

  async addAddress(
    userID: string,
    addressData: Omit<AddressRecord, 'id' | 'userID'>,
  ): Promise<void> {
    await this.addressRepository.manager.transaction(async (manager) => {
      await manager.query(
        'SELECT 1 FROM "users" WHERE "user_id" = $1 FOR UPDATE',
        [userID],
      );

      const [row] = await manager.query(
        'SELECT COUNT(*)::int AS count FROM "addresses" WHERE "user_id" = $1',
        [userID],
      );

      if (row && Number(row.count) >= 3) {
        throw new Error('max_addresses_per_user');
      }

      const address = manager.create(AddressModel, {
        ...addressData,
        user: { userID },
      });

      await manager.save(address);
    });
  }

  async getAll(userID: string): Promise<AddressRecord[]> {
    const addresses = await this.addressRepository.find({
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
    return addresses as AddressRecord[];
  }

  async delete(addressId: number, userID: string): Promise<number> {
    return (await this.addressRepository.delete({ id: addressId, userID }))
      .affected;
  }
}
