import {
  Permissions,
  defaultRoles,
} from '@modules/user2/domain/types/permissions';

export class UserEntity {
  _id?: number;
  user_id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  phonenumber: string;
  active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  roles: Permissions[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    _id: number;
    user_id: string;
    name: string;
    username: string;
    email: string;
    avatar: string | undefined;
    phonenumber: string;
    active?: boolean;
    email_verified?: boolean;
    phone_verified?: boolean;
    roles?: Permissions[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props._id;
    this.user_id = props.user_id;
    this.name = props.name;
    this.username = props.username;
    this.email = props.email;
    this.avatar = props.avatar;
    this.phonenumber = props.phonenumber;

    this.active = props.active ?? false;
    this.email_verified = props.email_verified ?? false;
    this.phone_verified = props.phone_verified ?? false;

    this.roles = props.roles ?? defaultRoles;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
