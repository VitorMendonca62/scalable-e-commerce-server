import { Permissions } from '../types/permissions';

export class User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  phonenumber: string;
  roles: Permissions[];

  constructor(data: User) {
    this._id = data._id;
    this.name = data.name;
    this.username = data.username;
    this.email = data.email;
    this.phonenumber = data.phonenumber;
    this.roles = data.roles;
  }
}
