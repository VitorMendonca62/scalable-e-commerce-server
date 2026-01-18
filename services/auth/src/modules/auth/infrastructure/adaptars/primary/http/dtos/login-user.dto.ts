// Docs decorator's
import { ApiEmail } from '../../common/decorators/docs/dtos/api-email.decorator';
import { ApiPassword } from '../../common/decorators/docs/dtos/api-password.decorator';

// Validation decorator's
import { Email } from '../decorators/dtos/email.decorator';
import { Password } from '../decorators/dtos/password.decorator';

export class LoginUserDTO {
  @Email()
  @ApiEmail(true)
  email: string;

  @Password('default', false)
  @ApiPassword(true)
  password: string;
}
