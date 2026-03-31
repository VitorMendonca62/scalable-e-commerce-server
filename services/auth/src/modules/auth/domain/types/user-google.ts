import { PermissionsSystem } from './permissions';

export interface UserGoogle {
  id: string;
  displayName: string;
  name: { familyName: string; givenName: string };
  emails: { value: string; verified: boolean }[];
  photos: { value: string }[];
}

export interface UserGoogleInCallBack {
  email: string;
  username: string;
  id: string;
  name: string;
}

export interface NewUserGoogle {
  userID: string;
  name: string;
  username: string;
  email: string;
  roles: PermissionsSystem[];
  createdAt: Date;
  updatedAt: Date;
}
