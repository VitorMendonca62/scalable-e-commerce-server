// Docs decorator's
import { ApiEmail } from '../../common/decorators/docs/dtos/api-email.decorator';
import { ApiEmailCode } from '../decorators/docs/dtos/api-email-code.decorator';
import { EmailCode } from '../decorators/dtos/email-code.decorator';

// Validation decorator's
import { Email } from '../decorators/dtos/email.decorator';

export class ValidateCodeForForgotPasswordDTO {
  @Email()
  @ApiEmail(true)
  email: string;

  @EmailCode()
  @ApiEmailCode()
  code: string;
}
