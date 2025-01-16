import { UpdateUserDTO } from '../../adaptars/primary/http/dto/update-user.dto';

export class UserUpdate {
  name?: string;
  username?: string;
  email?: string;
  phonenumber?: string;
  updatedAt: Date;

  constructor(data: UpdateUserDTO, updatedAt: Date) {
    if (data.name) this.name = data.name;
    if (data.username) this.username = data.username;
    if (data.email) this.email = data.email;
    if (data.phonenumber) this.phonenumber = data.phonenumber;
    this.updatedAt = updatedAt;
  }
}
