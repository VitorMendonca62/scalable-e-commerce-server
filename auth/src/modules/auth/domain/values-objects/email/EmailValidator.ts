import { isEmail, isNotEmpty } from 'class-validator';
import { EmailConstants } from './EmailConstants';
import { FieldInvalid } from '../../types/errors/errors';

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
