import { ApiAvatar } from '../../common/decorators/docs/dtos/api-avatar.decorator';
import { ApiEmail } from '../../common/decorators/docs/dtos/api-email.decorator';
import { ApiName } from '../../common/decorators/docs/dtos/api-name.decorator';
import { ApiPassword } from '../../common/decorators/docs/dtos/api-password.decorator';
import { ApiPhoneNumber } from '../../common/decorators/docs/dtos/api-phonenumber.decorator';
import { ApiUsername } from '../../common/decorators/docs/dtos/api-username.decorator';
import { Avatar } from '../../common/decorators/dtos/avatar.decorator';
import { Email } from '../../common/decorators/dtos/email.decorator';
import { Name } from '../../common/decorators/dtos/name.decorator';
import { Password } from '../../common/decorators/dtos/password.decorator';
import { PhoneNumber } from '../../common/decorators/dtos/phonenumber.decorator';
import { Username } from '../../common/decorators/dtos/username.decorator';

export class CreateUserDTO {
  @Name(true)
  @ApiName(true)
  name: string;

  @Username(true)
  @ApiUsername(true)
  username: string;

  @Email(true)
  @ApiEmail(true)
  email: string;

  @Password(true)
  @ApiPassword(true)
  password: string;

  @PhoneNumber(true)
  @ApiPhoneNumber(true)
  phonenumber: string;
}
