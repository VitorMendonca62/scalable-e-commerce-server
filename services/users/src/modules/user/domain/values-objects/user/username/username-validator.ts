import { isEmpty, isNotEmpty, isString, minLength } from 'class-validator';
import { UsernameConstants } from './username-constants';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';

export class UsernameValidator {
  static validate(value: string, required: boolean) {
    if (!required && isEmpty(value)) return;

    if (required && isEmpty(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_REQUIRED, 'username');
    }

    if (!isString(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_STRING, 'username');
    }

    if (!minLength(value, UsernameConstants.MIN_LENGTH)) {
      throw new FieldInvalid(UsernameConstants.ERROR_MIN_LENGTH, 'username');
    }

    if (/\s/.test(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_NO_SPACES, 'username');
    }
  }
}
