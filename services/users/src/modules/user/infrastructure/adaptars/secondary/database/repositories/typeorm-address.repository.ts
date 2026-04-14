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
    const address = this.addressRepository.create({
      ...addressData,
      user: { userID },
    });

    await this.addressRepository.save(address);
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
