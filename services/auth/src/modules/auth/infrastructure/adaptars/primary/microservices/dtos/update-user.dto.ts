import {
  ApiAvatar,
  ApiName,
  ApiPhoneNumber,
  ApiUsername,
  Avatar,
  Name,
  PhoneNumber,
  Username,
} from '../decorators/decorators';

export class UpdateUserDTO {
  userID: string;

  @Name()
  @ApiName()
  name?: string;

  @Username()
  @ApiUsername()
  username?: string;

  @Avatar()
  @ApiAvatar()
  avatar?: string;

  @PhoneNumber()
  @ApiPhoneNumber()
  phoneNumber?: string;
}
