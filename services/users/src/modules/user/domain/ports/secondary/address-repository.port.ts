import AddressModel from '@modules/user/infrastructure/adaptars/secondary/database/models/address.model';

export default abstract class AddressRepository {
  abstract addAddress(
    userID: string,
    addressData: Omit<AddressModel, 'id' | 'user'>,
  ): Promise<void>;

  abstract getAll(userID: string): Promise<AddressModel[]>;
  abstract countAddresses(userID: string): Promise<number>;

  abstract delete(addressIndex: number): Promise<void>;
}
