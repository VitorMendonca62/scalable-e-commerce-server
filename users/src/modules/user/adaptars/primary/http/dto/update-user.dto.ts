import { Email } from '../decorators/dto/email.decorator';
import { Name } from '../decorators/dto/name.decorator';
import { PhoneNumber } from '../decorators/dto/phonenumber.decorator';
import { Username } from '../decorators/dto/username.decorator';

export abstract class UpdateUserDTO {
  @Username(true)
  username?: string;

  @Name(true)
  name?: string;

  @Email(true)
  email?: string;

  @PhoneNumber(true)
  phonenumber?: string;
}
