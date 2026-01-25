import { PermissionsSystem } from '../types/permissions';
import { EmailVO, IDVO, PasswordHashedVO, PasswordVO } from '../values-objects';

export class UserEntity {
  userID: IDVO;
  email: EmailVO;
  password: PasswordVO | PasswordHashedVO;
  roles: PermissionsSystem[];
  active: boolean;
  accountProvider: string;
  accountProviderID: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    userID: IDVO;
    email: EmailVO;
    password: PasswordVO | PasswordHashedVO;
    roles: PermissionsSystem[];
    active: boolean;
    accountProvider: string;
    accountProviderID: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.userID = props.userID;
    this.email = props.email;
    this.password = props.password;
    this.roles = props.roles;
    this.active = props.active;
    this.accountProvider = props.accountProvider;
    this.accountProviderID = props.accountProviderID;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
