import { LoginUserDTO } from '@auth/adaptars/primary/http/dto/login-user.dto';

export class UserLogin {
  email: string;
  password: string;
  accessedAt: Date;

  constructor(data: LoginUserDTO, accessedAt: Date) {
    this.email = data.email;
    this.password = data.password;
    this.accessedAt = accessedAt;
  }
}
