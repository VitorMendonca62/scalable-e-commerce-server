import { AddressEntity } from '@modules/user2/infrastructure/adaptars/secondary/database/entities/address.entity';

export abstract class AddressRepositoy {
  abstract addAddress(address: AddressEntity): Promise<void>;
  abstract getAll(userId: string): Promise<AddressEntity[]>;
}
