// Docs decorator's
import { IsStrongPassword } from 'class-validator';
import { ApiPassword } from '../../common/decorators/docs/dtos/api-password.decorator';

// Validation decorator's
import { Password } from '../decorators/dtos/password.decorator';
import { PasswordConstants } from '@auth/domain/values-objects/constants';
import { addPrefix } from '@auth/infrastructure/helpers/string-helper';

export class UpdatePasswordDTO {
  @IsStrongPassword(PasswordConstants.STRONG_OPTIONS, {
    message: addPrefix(PasswordConstants.ERROR_WEAK_PASSWORD, 'new'),
  })
  @Password('new')
  @ApiPassword(true)
  newPassword: string;

  @Password('old')
  @ApiPassword(true)
  oldPassword: string;
}
