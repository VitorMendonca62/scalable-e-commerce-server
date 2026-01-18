import { PermissionsSystem } from '@auth/domain/types/permissions';

export const defaultRoles = [
  PermissionsSystem.READ_ITEMS,
  PermissionsSystem.CHANGE_PASSWORD,
];

export const defaultGoogleRoles = [
  PermissionsSystem.READ_ITEMS,
  PermissionsSystem.CAN_NEW_PASSWORD,
];
