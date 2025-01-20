import { LoginUserDTO } from '@modules/auth/adaptars/primary/http/dtos/login-user.dto';

export class UserLogin {
  email: string;
  password: string;
  accessedAt: Date;

  constructor(data: LoginUserDTO) {
    this.email = data.email;
    this.password = data.password;
    this.accessedAt = new Date();
  }
}
