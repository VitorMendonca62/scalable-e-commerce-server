import { Email } from '../decorators/dto/email.decorator';
import { Name } from '../decorators/dto/name.decorator';
import { PhoneNumber } from '../decorators/dto/phonenumber.decorator';
import { Username } from '../decorators/dto/username.decorator';

export abstract class UpdateUserDTO {
  @Username()
  username: string;

  @Name()
  name: string;

  @Email()
  email: string;

  @PhoneNumber()
  phonenumber: string;
}
