import { Email } from '@modules/user/adaptars/primary/common/decorators/dtos/email.decorator';
import { Name } from '@modules/user/adaptars/primary/common/decorators/dtos/name.decorator';
import { PhoneNumber } from '@modules/user/adaptars/primary/common/decorators/dtos/phonenumber.decorator';
import { Username } from '@modules/user/adaptars/primary/common/decorators/dtos/username.decorator';
import { ApiUsername } from '../../../../../../user/adaptars/primary/common/decorators/docs/dtos/api-username.decorator';
import { ApiEmail } from '../../../../../../user/adaptars/primary/common/decorators/docs/dtos/api-email.decorator';
import { ApiPhoneNumber } from '../../../../../../user/adaptars/primary/common/decorators/docs/dtos/api-phonenumber.decorator';
import { ApiName } from '../../../../../../user/adaptars/primary/common/decorators/docs/dtos/api-name.decorator';

export abstract class UpdateUserDTO {
  @Username(true)
  @ApiUsername(false)
  username?: string;

  @Name(true)
  @ApiName(false)
  name?: string;

  @Email(true)
  @ApiEmail(false)
  email?: string;

  @PhoneNumber(true)
  @ApiPhoneNumber(false)
  phonenumber?: string;
}
