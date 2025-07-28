// Enums
import { Permissions } from '../types/permissions';

// Values Objects
import EmailVO from '../values-objects/email/email-vo';
import PasswordVO from '../values-objects/password/password-vo';
import PhoneNumberVO from '../values-objects/phone-number/phone-number-vo';
import NameVO from '../values-objects/name/name-vo';
import UsernameVO from '../values-objects/username/username-vo';

export class User {
  _id?: string;
  name: NameVO;
  username: UsernameVO;
  email: EmailVO;
  password: PasswordVO;
  phonenumber: PhoneNumberVO;
  roles: Permissions[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    _id?: string;
    name: NameVO;
    username: UsernameVO;
    email: EmailVO;
    password: PasswordVO;
    phonenumber: PhoneNumberVO;
    roles?: Permissions[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props._id;
    this.name = props.name;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.phonenumber = props.phonenumber;
    this.roles = props.roles;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
