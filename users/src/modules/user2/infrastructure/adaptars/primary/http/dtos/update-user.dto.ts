import { ApiAvatar } from '../../common/decorators/docs/dtos/api-avatar.decorator';
import { ApiEmail } from '../../common/decorators/docs/dtos/api-email.decorator';
import { ApiName } from '../../common/decorators/docs/dtos/api-name.decorator';
import { ApiPhoneNumber } from '../../common/decorators/docs/dtos/api-phonenumber.decorator';
import { ApiUsername } from '../../common/decorators/docs/dtos/api-username.decorator';
import { Avatar } from '../../common/decorators/dtos/avatar.decorator';
import { Email } from '../../common/decorators/dtos/email.decorator';
import { Name } from '../../common/decorators/dtos/name.decorator';
import { PhoneNumber } from '../../common/decorators/dtos/phonenumber.decorator';
import { Username } from '../../common/decorators/dtos/username.decorator';

export abstract class UpdateUserDTO {
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
