import {
  ApiEmail,
  ApiEmailCode,
  Email,
  EmailCode,
} from '../../../common/decorators/dtos/user/decorators';

export class ValidateCodeForValidateEmailDTO {
  @Email()
  @ApiEmail()
  email: string;

  @EmailCode()
  @ApiEmailCode()
  code: string;
}
