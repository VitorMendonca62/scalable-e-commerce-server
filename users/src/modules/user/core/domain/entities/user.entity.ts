import { Permissions } from '../types/permissions';

export class User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
  phonenumber: string;
  roles: Permissions[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: User, createdAt?: Date, updatedAt?: Date) {
    this._id = data._id;
    this.name = data.name;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.phonenumber = data.phonenumber;
    this.createdAt = createdAt ? createdAt : new Date();
    this.updatedAt = updatedAt ? updatedAt : new Date();
    this.roles = data.roles;
  }
}
