import { LoginUserDTO } from '@modules/auth/adaptars/primary/http/dtos/login-user.dto';

// Values Objects
import EmailVO from '../types/values-objects/email.vo';
import PasswordVO from '../types/values-objects/password.vo';

export class UserLogin {
  email: EmailVO;
  password: PasswordVO;
  accessedAt: Date;

  constructor(data: LoginUserDTO) {
    this.email = new EmailVO(data.email);
    this.password = new PasswordVO(data.password, false);
    this.accessedAt = new Date();
  }
}
