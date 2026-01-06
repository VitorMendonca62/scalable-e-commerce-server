import { ApiEmail } from '../../common/decorators/docs/dtos/user/api-email.decorator';
import { ApiName } from '../../common/decorators/docs/dtos/user/api-name.decorator';
import { ApiPassword } from '../../common/decorators/docs/dtos/user/api-password.decorator';
import { ApiPhoneNumber } from '../../common/decorators/docs/dtos/user/api-phonenumber.decorator';
import { ApiUsername } from '../../common/decorators/docs/dtos/user/api-username.decorator';
import { Email } from '../../common/decorators/dtos/user/email.decorator';
import { Name } from '../../common/decorators/dtos/user/name.decorator';
import { Password } from '../../common/decorators/dtos/user/password.decorator';
import { PhoneNumber } from '../../common/decorators/dtos/user/phonenumber.decorator';
import { Username } from '../../common/decorators/dtos/user/username.decorator';

export class CreateUserDTO {
  @Name()
  @ApiName()
  name: string;

  @Username()
  @ApiUsername()
  username: string;

  @Email()
  @ApiEmail()
  email: string;

  @Password(true)
  @ApiPassword()
  password: string;

  @PhoneNumber()
  @ApiPhoneNumber()
  phonenumber: string;
}
