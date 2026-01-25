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

  @Password(true)
  @ApiPassword()
  password: string;

  @PhoneNumber()
  @ApiPhoneNumber()
  phoneNumber: string;
}
