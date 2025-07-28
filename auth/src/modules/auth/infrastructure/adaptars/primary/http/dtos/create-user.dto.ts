// Decorators
import { ApiEmail } from '../decorators/docs/dtos/api-email.decorator';
import { ApiName } from '../decorators/docs/dtos/api-name.decorator';
import { ApiPassword } from '../decorators/docs/dtos/api-password.decorator';
import { ApiPhoneNumber } from '../decorators/docs/dtos/api-phonenumber.decorator';
import { ApiUsername } from '../decorators/docs/dtos/api-username.decorator';
import { Email } from '../decorators/dtos/email.decorator';
import { Name } from '../decorators/dtos/name.decorator';
import { Password } from '../decorators/dtos/password.decorator';
import { PhoneNumber } from '../decorators/dtos/phonenumber.decorator';
import { Username } from '../decorators/dtos/username.decorator';

export class CreateUserDTO {
  @Username()
  @ApiUsername(true)
  username: string;

  @Name()
  @ApiName(true)
  name: string;

  @Email()
  @ApiEmail(true)
  email: string;

  @Password(true)
  @ApiPassword(true)
  password: string;

  @PhoneNumber()
  @ApiPhoneNumber(true)
  phonenumber: string;
}
