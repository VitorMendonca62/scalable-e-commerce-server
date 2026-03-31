import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { PermissionsSystem } from '@auth/domain/types/permissions';

export interface UserRecord {
  userID: string;
  email: string;
  password: string | null | undefined;
  roles: PermissionsSystem[];
  accountProvider: AccountsProvider | string;
  accountProviderID: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
