import { AddressRecord } from '@user/domain/types/address-record';

export default abstract class AddressRepository {
  abstract addAddress(
    userID: string,
    addressData: Omit<AddressRecord, 'id' | 'userID'>,
  ): Promise<void>;

  abstract getAll(userID: string): Promise<AddressRecord[]>;
  abstract countAddresses(userID: string): Promise<number>;

  abstract delete(addressId: number): Promise<void>;
}
