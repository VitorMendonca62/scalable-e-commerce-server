// Enums
import { Permissions } from '../types/permissions';
import AvatarVO from '../values-objects/user/avatar/avatar-vo';
import EmailVO from '../values-objects/user/email/email-vo';
import NameVO from '../values-objects/user/name/name-vo';
import PhoneNumberVO from '../values-objects/user/phone-number/phone-number-vo';
import UsernameVO from '../values-objects/user/username/username-vo';
import IDVO from '../values-objects/uuid/id-vo';

export class User {
  _id?: number;
  userId: IDVO;
  name: NameVO;
  username: UsernameVO;
  email: EmailVO;
  avatar?: AvatarVO;
  active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  phonenumber: PhoneNumberVO;
  roles: Permissions[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    _id?: number;
    userId: IDVO;
    name: NameVO;
    username: UsernameVO;
    email: EmailVO;
    avatar: AvatarVO | null;
    phonenumber: PhoneNumberVO;
    active: boolean;
    email_verified: boolean;
    phone_verified: boolean;
    roles: Permissions[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props._id;
    this.userId = props.userId;
    this.name = props.name;
    this.username = props.username;
    this.email = props.email;
    this.avatar = props.avatar;
    this.phonenumber = props.phonenumber;

    this.active = props.active;
    this.email_verified = props.email_verified;
    this.phone_verified = props.phone_verified;

    this.roles = props.roles;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
