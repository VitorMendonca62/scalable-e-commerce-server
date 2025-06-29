import { ApiEmail } from '../decorators/docs/dtos/api-email.decorator';
import { ApiPassword } from '../decorators/docs/dtos/api-password.decorator';
import { Email } from '../decorators/dtos/email.decorator';
import { Password } from '../decorators/dtos/password.decorator';

export class LoginUserDTO {
  @Email(false)
  @ApiEmail(true)
  email: string;

  @Password(false, false)
  @ApiPassword(true)
  password: string;
}
