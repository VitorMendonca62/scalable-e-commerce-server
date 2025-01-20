import { ApiEmail } from '../decorators/docs/api-email.decorator';
import { ApiPassword } from '../decorators/docs/api-password.decorator';
import { Email } from '../decorators/dto/email.decorator';
import { Password } from '../decorators/dto/password.decorator';

export abstract class LoginUserDTO {
  @Email(false)
  @ApiEmail(true)
  email: string;

  @Password(false)
  @ApiPassword(true)
  password: string;
}
