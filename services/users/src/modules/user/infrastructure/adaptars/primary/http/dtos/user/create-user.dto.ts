import { PasswordConstants } from '@user/domain/constants/password-constants';
import { IsStrongPassword } from 'class-validator';
import {
  ApiName,
  ApiPassword,
  ApiPhoneNumber,
  ApiUsername,
  Name,
  Password,
  PhoneNumber,
  Username,
} from '../../../common/decorators/dtos/user/decorators';

export class CreateUserDTO {
  @Name()
  @ApiName()
  name: string;

  @Username()
  @ApiUsername()
  username: string;

  @IsStrongPassword(PasswordConstants.STRONG_OPTIONS, {
    message: PasswordConstants.ERROR_WEAK_PASSWORD,
  })
  @Password()
  @ApiPassword()
  password: string;

  @PhoneNumber()
  @ApiPhoneNumber()
  phoneNumber: string;
}
