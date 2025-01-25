import { Email } from '@user/adaptars/primary/common/decorators/dto/email.decorator';
import { Name } from '@user/adaptars/primary/common/decorators/dto/name.decorator';
import { PhoneNumber } from '@user/adaptars/primary/common/decorators/dto/phonenumber.decorator';
import { Username } from '@user/adaptars/primary/common/decorators/dto/username.decorator';

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
