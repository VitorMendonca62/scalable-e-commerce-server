import { isNotEmpty, isString, length } from 'class-validator';
import { UsernameConstants } from './uuid-constants';
import { FieldInvalid } from '@modules/user2/domain/ports/primary/http/error.port';

export class UsernameValidator {
  static validate(value: string) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_REQUIRED, 'username');
    }

    if (!isString(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_STRING, 'username');
    }

    if (!length(value, UsernameConstants.MIN_LENGTH)) {
      throw new FieldInvalid(UsernameConstants.ERROR_MIN_LENGTH, 'username');
    }

    if (/\s/.test(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_NO_SPACES, 'username');
    }
  }
}
