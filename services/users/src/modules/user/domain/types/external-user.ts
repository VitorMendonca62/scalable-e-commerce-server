import { PermissionsSystem } from './permissions';

export interface ExternalUser {
  userID: string;
  email: string;
  name: string;
  username: string;
  roles: PermissionsSystem[];
  createdAt: Date;
  updatedAt: Date;
}
