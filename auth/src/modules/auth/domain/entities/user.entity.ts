// Enums
import { Permissions } from '../types/permissions';

// Values Objects
import EmailVO from '../values-objects/email/EmailVO';
import PasswordVO from '../values-objects/password/PasswordVO';
import PhoneNumberVO from '../values-objects/phone-number/PhoneNumberVO';
import NameVO from '../values-objects/name/NameVO';
import UsernameVO from '../values-objects/username/UsernameVO';

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
