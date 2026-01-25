import { PermissionsSystem } from './permissions';

export interface ExternalUser {
  userID: string;
  name: string;
  username: string;
  email: string;
  roles: PermissionsSystem[];
  createdAt: Date;
  updatedAt: Date;
}
