import { AddressRepositoy } from '@user/domain/ports/secondary/address-repository.port';
import { AddressEntity } from '../entities/address.entity';

export default class InMemoryAddressRepository implements AddressRepositoy {
  private addresses: AddressEntity[] = [];
  private lastID: number = 0;
  private readonly keysCanToLowerCase: string[] = [
    'street',
    'complement',
    'neighborhood',
    'city',
    'state',
    'country',
  ];

  async addAddress(address: AddressEntity) {
    this.lastID++;
    address.id = this.lastID;
    this.addresses.push(address);
  }

  async getAll(userId: string): Promise<AddressEntity[]> {
    return this.addresses.filter((address) => address.userId == userId);
  }

  // Todo consertar essa funcao
  async delete(userId: string, addressIndex: number): Promise<void> {
    const addresses = this.addresses.filter(
      (address) => address.userId === userId,
    );

    const index = addresses.findIndex((_, i) => i == addressIndex );

    this.addresses.splice(index, 1);
  }
}
