import { CreateUserDTO } from '../../../adaptars/primary/http/dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
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

  constructor(data: CreateUserDTO) {
    this.name = data.name;
    this.username = data.username;
    this.email = data.email;
    this.password = this.hashPassword(data.password);
    this.phonenumber = data.phonenumber;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.roles = [Permissions.READ_ITEMS, Permissions.ENTER];
  }

  hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  validatePassword(inputPassword: string) {
    return bcrypt.compareSync(inputPassword, this.password);
  }
}
