import { AddressRepositoy } from '@user/domain/ports/secondary/address-repository.port';
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
    return this.sortAddresses(
      this.addresses.filter((address) => address.userId == userId),
    );
  }

  // Todo consertar essa funcao
  async delete(userId: string, addressIndex: number): Promise<void> {
    const addresses = this.sortAddresses(
      this.addresses.filter((address) => address.userId === userId),
    );

    const index = this.addresses.findIndex(
      (item) => item.id == addresses[addressIndex].id,
    );
 
    this.addresses.splice(index, 1);
  }

  private sortAddresses(addresses: AddressEntity[]): AddressEntity[] {
    return addresses.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return dateA.getTime() - dateB.getTime();
    });
  }
}
