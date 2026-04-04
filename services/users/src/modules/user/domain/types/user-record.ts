import { PermissionsSystem } from '@user/domain/types/permissions';
import { AddressRecord } from '@user/domain/types/address-record';

export type UserRecord = {
  userID: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  phoneNumber: string | null;
  roles: PermissionsSystem[];
  addresses?: AddressRecord[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};
