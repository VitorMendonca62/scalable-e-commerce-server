import { CreateUserDTO } from '../../../adaptars/primary/http/dtos/create-user.dto';
import { Permissions } from '../types/permissions';

// Values Objects
import EmailVO from '../types/values-objects/email.vo';
import PasswordVO from '../types/values-objects/password.vo';
import PhoneNumberVO from '../types/values-objects/phonenumber.vo';
import NameVO from '../types/values-objects/name.vo';
import UsernameVO from '../types/values-objects/username.vo';

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

  constructor(data: CreateUserDTO) {
    this.name = new NameVO(data.name, false);
    this.username = new UsernameVO(data.username, false);
    this.email = new EmailVO(data.email);
    this.password = new PasswordVO(data.password, true);
    this.phonenumber = new PhoneNumberVO(data.phonenumber, false);
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.roles = [Permissions.READ_ITEMS, Permissions.ENTER];
  }
}
