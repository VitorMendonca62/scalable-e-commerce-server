import { CreateUserDTO } from '../../adaptars/primary/http/dto/create-user.dto';

export class User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
  phonenumber: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CreateUserDTO, createdAt: Date, updatedAt: Date) {
    this.name = data.name;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.phonenumber = data.phonenumber;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
