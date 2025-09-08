import { ApiAvatar } from '../../common/decorators/docs/dtos/user/api-avatar.decorator';
import { ApiEmail } from '../../common/decorators/docs/dtos/user/api-email.decorator';
import { ApiName } from '../../common/decorators/docs/dtos/user/api-name.decorator';
import { ApiPhoneNumber } from '../../common/decorators/docs/dtos/user/api-phonenumber.decorator';
import { ApiUsername } from '../../common/decorators/docs/dtos/user/api-username.decorator';
import { Avatar } from '../../common/decorators/dtos/user/avatar.decorator';
import { Email } from '../../common/decorators/dtos/user/email.decorator';
import { Name } from '../../common/decorators/dtos/user/name.decorator';
import { PhoneNumber } from '../../common/decorators/dtos/user/phonenumber.decorator';
import { Username } from '../../common/decorators/dtos/user/username.decorator';

export class UpdateUserDTO {
  @Username(false)
  @ApiUsername(false)
  username?: string;

  @Name(false)
  @ApiName(false)
  name?: string;

  @Email(false)
  @ApiEmail(false)
  email?: string;

  @PhoneNumber(false)
  @ApiPhoneNumber(false)
  phonenumber?: string;

  @Avatar(false)
  @ApiAvatar(false)
  avatar?: string;
}
