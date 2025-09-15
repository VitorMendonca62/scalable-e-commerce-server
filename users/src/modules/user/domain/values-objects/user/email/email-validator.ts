import { isEmail, isEmpty, isNotEmpty, isString } from 'class-validator';
import { EmailConstants } from './email-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class EmailValidator {
  static validate(value: string, required: boolean) {
    if (!required && isEmpty(value)) return;

    if (required && isEmpty(value)) {
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
