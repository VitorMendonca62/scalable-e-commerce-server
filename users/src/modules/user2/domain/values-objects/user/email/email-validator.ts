import { isEmail, isNotEmpty } from 'class-validator';
import { EmailConstants } from './email-constants';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';

export class EmailValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(EmailConstants.ERROR_REQUIRED, 'email');
    }

    if (!isEmail(value)) {
      throw new FieldInvalid(EmailConstants.ERROR_INVALID, 'email');
    }
  }
}
