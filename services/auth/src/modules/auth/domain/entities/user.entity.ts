import { PermissionsSystem } from '../types/permissions';
import { EmailVO, IDVO, PasswordHashedVO } from '../values-objects';

export class UserEntity {
  userID: IDVO;
  email: EmailVO;
  password: PasswordHashedVO;
  roles: PermissionsSystem[];
  accountProvider: string;
  accountProviderID: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor(props: {
    userID: IDVO;
    email: EmailVO;
    password: PasswordHashedVO;
    roles: PermissionsSystem[];
    accountProvider: string;
    accountProviderID: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
  }) {
    this.userID = props.userID;
    this.email = props.email;
    this.password = props.password;
    this.roles = props.roles;
    this.accountProvider = props.accountProvider;
    this.accountProviderID = props.accountProviderID;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
