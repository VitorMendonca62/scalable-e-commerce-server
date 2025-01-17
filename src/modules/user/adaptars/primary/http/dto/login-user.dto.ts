import { Email } from '../decorators/dto/email.decorator';
import { Password } from '../decorators/dto/password.decorator';

export abstract class LoginUserDTO {
  @Email(false)
  email: string;

  @Password(false)
  password: string;
}
