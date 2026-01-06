// Docs decorator's
import { ApiEmail } from '../../common/decorators/docs/dtos/api-email.decorator';

// Validation decorator's
import { Email } from '../decorators/dtos/email.decorator';

export class SendCodeForForgotPasswordDTO {
  @Email()
  @ApiEmail(true)
  email: string;
}
