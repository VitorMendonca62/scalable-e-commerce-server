import { AddressRepositoy } from '@modules/user2/domain/ports/secondary/address-repository.port';
import { AddressEntity } from '../entities/address.entity';

export default class InMemoryAddressRepository implements AddressRepositoy {
  private addresses: AddressEntity[] = [];
  private lastID: number = 0;

  async addAddress(address: AddressEntity) {
    this.lastID++;
    address.id = this.lastID;
    this.addresses.push(address);
  }

  async getAll(userId: string): Promise<AddressEntity[]> {
    return this.addresses.filter((address) => address.userId == userId);
  }
}
