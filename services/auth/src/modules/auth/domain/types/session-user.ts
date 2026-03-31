import { AccountsProvider } from './accounts-provider';
import { PermissionsSystem } from './permissions';

export type SessionUser = {
  userID: string;
  email: string;
  password: string | null | undefined;
  roles: PermissionsSystem[];
  accountProvider: AccountsProvider;
  accountProviderID: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
};
