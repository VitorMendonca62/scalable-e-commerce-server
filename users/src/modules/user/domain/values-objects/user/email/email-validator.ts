import { isEmail, isNotEmpty, isString } from 'class-validator';
import { EmailConstants } from './email-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class EmailValidator {
  static validate(value: string, required: boolean) {
    if (required && !isNotEmpty(value)) {
      throw new FieldInvalid(EmailConstants.ERROR_REQUIRED, 'email');
    }

    if (!isString(value)) {
      throw new FieldInvalid(EmailConstants.ERROR_STRING, 'email');
    }

    if (!isEmail(value)) {
      throw new FieldInvalid(EmailConstants.ERROR_INVALID, 'email');
    }
  }
}
