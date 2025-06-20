import { isEmail, isNotEmpty } from 'class-validator';
import { EmailConstants } from './EmailConstants';
import { HttpFieldInvalid } from '../../types/errors/errors';

export class EmailValidator {
  static isValid(value: string) {
    if (!isNotEmpty(value)) {
      throw new HttpFieldInvalid(EmailConstants.ERROR_REQUIRED, 'email');
    }

    if (!isEmail(value)) {
      throw new HttpFieldInvalid(EmailConstants.ERROR_INVALID, 'email');
    }
  }
}
