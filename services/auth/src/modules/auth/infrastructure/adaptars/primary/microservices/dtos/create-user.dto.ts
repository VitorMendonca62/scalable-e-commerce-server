import { PermissionsSystem } from '@auth/domain/types/permissions';

export interface CreateExternalUserDTO {
  userID: string;
  email: string;
  password: string;
  roles: PermissionsSystem[];
  createdAt: string;
  updatedAt: string;
}
