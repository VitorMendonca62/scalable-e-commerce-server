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

export abstract class CreateUserDTO {
  @Username(false)
  @ApiUsername(true)
  username: string;

  @Name(false)
  @ApiName(true)
  name: string;

  @Email(false)
  @ApiEmail(true)
  email: string;

  @Password(true)
  @ApiPassword(true)
  password: string;

  @PhoneNumber(false)
  @ApiPhoneNumber(true)
  phonenumber: string;
}
