import AddressRepository from '@modules/user/domain/ports/secondary/address-repository.port';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import AddressModel from '../models/address.model';

@Injectable()
export default class TypeOrmAddressRepository implements AddressRepository {
  constructor(
    @InjectRepository(AddressModel)
    private addressRepository: Repository<AddressModel>,
  ) {}

  async addAddress(
    userID: string,
    addressData: Omit<AddressModel, 'id' | 'user'>,
  ): Promise<void> {
    const address = this.addressRepository.create({
      ...addressData,
      user: { userID },
    });

    await this.addressRepository.save(address);
  }

  async getAll(userID: string): Promise<AddressModel[]> {
    return await this.addressRepository.find({
      where: {
        user: {
          userID: userID,
        },
      },
      order: { createdAt: 'ASC' },
    });
  }

  async countAddresses(userID: string): Promise<number> {
    return await this.addressRepository.count({
      where: {
        user: {
          userID,
        },
      },
    });
  }

  async delete(addressIndex: number): Promise<void> {
    await this.addressRepository.delete({ id: addressIndex });
  }
}
