import { PermissionsSystem } from '@auth/domain/types/permissions';

export const defaultRoles = [
  PermissionsSystem.READ_ITEMS,
  PermissionsSystem.CHANGE_PASSWORD,
];

export const defaultGoogleRoles = [PermissionsSystem.SHOULD_CHANGE_PASSWORD];
