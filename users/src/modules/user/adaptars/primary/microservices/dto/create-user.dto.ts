import { Permissions } from '@modules/user/core/domain/types/permissions';
import { Name } from '@modules/user/adaptars/primary/common/decorators/dtos/name.decorator';
import { Email } from '@modules/user/adaptars/primary/common/decorators/dtos/email.decorator';
import { PhoneNumber } from '@modules/user/adaptars/primary/common/decorators/dtos/phonenumber.decorator';
import { Username } from '@modules/user/adaptars/primary/common/decorators/dtos/username.decorator';
import { ApiName } from '../../common/decorators/docs/dtos/api-name.decorator';
import { ApiPhoneNumber } from '../../common/decorators/docs/dtos/api-phonenumber.decorator';
import { ApiEmail } from '../../common/decorators/docs/dtos/api-email.decorator';
import { ApiUsername } from '../../common/decorators/docs/dtos/api-username.decorator';

export abstract class CreateUserDTO {
  _id: string;

  @Name(false)
  @ApiName(true)
  name: string;

  @Username(false)
  @ApiUsername(true)
  username: string;

  @Email(false)
  @ApiEmail(true)
  email: string;

  @PhoneNumber(false)
  @ApiPhoneNumber(true)
  phonenumber: string;

  roles: Permissions[];
}
