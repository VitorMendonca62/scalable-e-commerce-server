import { Email } from '../decorators/dto/email.decorator';
import { Name } from '../decorators/dto/name.decorator';
import { Password } from '../decorators/dto/password.decorator';
import { PhoneNumber } from '../decorators/dto/phonenumber.decorator';
import { Username } from '../decorators/dto/username.decorator';

export abstract class CreateUserDTO {
  @Username()
  username: string;

  @Name()
  name: string;

  @Email()
  email: string;

  @Password()
  password: string;

  @PhoneNumber()
  phonenumber: string;
}
