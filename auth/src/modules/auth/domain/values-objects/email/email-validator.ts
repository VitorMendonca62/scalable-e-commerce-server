import { isEmail, isNotEmpty } from 'class-validator';
import { EmailConstants } from './email-constants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

export class EmailValidator {
  static isValid(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(EmailConstants.ERROR_REQUIRED, 'email');
    }

    if (!isEmail(value)) {
      throw new FieldInvalid(EmailConstants.ERROR_INVALID, 'email');
    }
  }
}
