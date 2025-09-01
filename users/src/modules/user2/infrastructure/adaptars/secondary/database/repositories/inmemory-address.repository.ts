import { AddressRepositoy } from '@modules/user2/domain/ports/secondary/address-repository.port';
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

  async findOne(
    options: Partial<Record<keyof AddressEntity, any>>,
  ): Promise<AddressEntity> {
    return this.addresses.find((addres) => {
      for (const key of Object.keys(options)) {
        if (this.keysCanToLowerCase.includes(key)) {
          options[key] = options[key].toLowerCase();
        }

        const value = this.keysCanToLowerCase.includes(key)
          ? addres[key].toLowerCase()
          : addres[key];
        if (options[key] != value) {
          return false;
        }
      }

      return true;
    });
  }
  async delete(userId: string, addressIndex: number): Promise<void> {
    const addresses = this.addresses.filter(
      (address) => address.userId === userId,
    );

    const index = this.addresses.findIndex((_, i) => i == addressIndex );

    this.addresses.splice(index, 1);
  }
}
