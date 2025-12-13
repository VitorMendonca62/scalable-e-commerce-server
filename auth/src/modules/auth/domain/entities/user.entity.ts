// Enums
import { Permissions } from '../types/permissions';

// Values Objects
import EmailVO from '../values-objects/email/email-vo';
import PasswordVO from '../values-objects/password/password-vo';
import PhoneNumberVO from '../values-objects/phone-number/phone-number-vo';
import IDVO from '../values-objects/id/id-vo';

export class User {
  userID: IDVO;
  email: EmailVO;
  password: PasswordVO;
  phoneNumber: PhoneNumberVO;
  roles: Permissions[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    userID: IDVO;
    email: EmailVO;
    password: PasswordVO;
    phoneNumber: PhoneNumberVO;
    roles: Permissions[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.userID = props.userID;
    this.email = props.email;
    this.password = props.password;
    this.phoneNumber = props.phoneNumber;
    this.roles = props.roles;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
