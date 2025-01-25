import { Permissions } from '@modules/user/core/domain/types/permissions';
import { Name } from '@user/adaptars/primary/common/decorators/dto/name.decorator';
import { Email } from '@user/adaptars/primary/common/decorators/dto/email.decorator';
import { PhoneNumber } from '@user/adaptars/primary/common/decorators/dto/phonenumber.decorator';
import { Username } from '@user/adaptars/primary/common/decorators/dto/username.decorator';

export abstract class CreateUserDTO {
  _id: string;

  @Name(false)
  name: string;

  @Username(false)
  username: string;

  @Email(false)
  email: string;

  @PhoneNumber(false)
  phonenumber: string;

  roles: Permissions[];
}
