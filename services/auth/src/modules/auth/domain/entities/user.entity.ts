// Values Objects
import { PermissionsSystem } from '@auth/domain/types/permissions';
import EmailVO from '../values-objects/email/email-vo';
import PasswordVO from '../values-objects/password/password-vo';
import PhoneNumberVO from '../values-objects/phone-number/phone-number-vo';
import IDVO from '../values-objects/id/id-vo';
import PasswordHashedVO from '../values-objects/password-hashed/password-hashed-vo';

export class UserEntity {
  userID: IDVO;
  email: EmailVO;
  password: PasswordVO | PasswordHashedVO;
  phoneNumber: PhoneNumberVO;
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
    phoneNumber: PhoneNumberVO;
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
    this.phoneNumber = props.phoneNumber;
    this.roles = props.roles;
    this.active = props.active;
    this.accountProvider = props.accountProvider;
    this.accountProviderID = props.accountProviderID;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
