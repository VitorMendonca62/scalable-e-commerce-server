import AddressModel from '@modules/user/infrastructure/adaptars/secondary/database/models/address.model';

export default abstract class AddressRepository {
  abstract addAddress(address: Omit<AddressModel, 'id'>): Promise<void>;

  abstract getAll(userID: string): Promise<AddressModel[]>;
  abstract countAddresses(userID: string): Promise<number>;

  abstract delete(addressIndex: number): Promise<void>;
}
