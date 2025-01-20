import { ApiEmail } from '../decorators/docs/api-email.decorator';
import { ApiName } from '../decorators/docs/api-name.decorator';
import { ApiPassword } from '../decorators/docs/api-password.decorator';
import { ApiPhoneNumber } from '../decorators/docs/api-phonenumber.decorator';
import { ApiUsername } from '../decorators/docs/api-username.decorator';
import { Email } from '../decorators/dto/email.decorator';
import { Name } from '../decorators/dto/name.decorator';
import { Password } from '../decorators/dto/password.decorator';
import { PhoneNumber } from '../decorators/dto/phonenumber.decorator';
import { Username } from '../decorators/dto/username.decorator';

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
