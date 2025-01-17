import { LoginUserDTO } from '@modules/user/adaptars/primary/http/dto/login-user.dto';

export class UserLogin {
  email: string;
  password: string;

  constructor(data: LoginUserDTO) {
    this.email = data.email;
    this.password = data.password;
  }
}
