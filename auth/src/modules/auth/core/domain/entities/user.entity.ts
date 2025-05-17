import { defaultRoles, Permissions } from '../types/permissions';

// Values Objects
import EmailVO from '../types/values-objects/email.vo';
import PasswordVO from '../types/values-objects/password.vo';
import PhoneNumberVO from '../types/values-objects/phonenumber.vo';
import NameVO from '../types/values-objects/name.vo';
import UsernameVO from '../types/values-objects/username.vo';
import { v4 } from 'uuid';

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
    this._id = props._id ?? v4();
    this.name = props.name;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.phonenumber = props.phonenumber;
    this.roles = props.roles ?? defaultRoles;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
