import { AddressEntity } from '@user/infrastructure/adaptars/secondary/database/entities/address.entity';

export abstract class AddressRepositoy {
  abstract addAddress(address: AddressEntity): Promise<void>;
  abstract getAll(userId: string): Promise<AddressEntity[]>;
  abstract delete(userId: string, addressIndex: number): Promise<void>;
}
