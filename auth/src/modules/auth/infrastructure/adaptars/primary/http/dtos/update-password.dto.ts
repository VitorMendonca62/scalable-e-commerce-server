// Docs decorator's
import { ApiPassword } from '../../common/decorators/docs/dtos/api-password.decorator';

// Validation decorator's
import { Password } from '../decorators/dtos/password.decorator';

export class UpdatePasswordDTO {
  @Password('new')
  @ApiPassword(true)
  newPassword: string;

  @Password('old')
  @ApiPassword(true)
  oldPassword: string;
}
