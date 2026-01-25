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

  async addAddress(address: Omit<AddressModel, 'id'>): Promise<void> {
    await this.addressRepository.save(address);
  }

  async getAll(userID: string): Promise<AddressModel[]> {
    return await this.addressRepository.findBy({ userID });
  }

  async countAddresses(userID: string): Promise<number> {
    return (await this.addressRepository.findBy({ userID })).length;
  }

  async delete(addressIndex: number): Promise<void> {
    await this.addressRepository.delete({ id: addressIndex });
  }
}
