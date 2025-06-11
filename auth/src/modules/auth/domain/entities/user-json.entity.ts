import { defaultRoles, Permissions } from '../types/permissions';

export class UserJSON {
  _id?: string;

  name: string;

  username: string;

  email: string;

  password: string;

  phonenumber: string;

  roles: Permissions[];

  createdAt: Date;

  updatedAt: Date;

  constructor(props: {
    _id?: string;
    name: string;
    username: string;
    email: string;
    password: string;
    phonenumber: string;
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
    this.roles = props.roles ?? defaultRoles;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
