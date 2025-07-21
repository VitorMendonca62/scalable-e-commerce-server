import { isNotEmpty, isString, length } from 'class-validator';
import { UsernameConstants } from './UsernameConstants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

export class UsernameValidator {
  static isValid(value: string, isOptional: boolean) {
    if (!isOptional && !isNotEmpty(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_REQUIRED, 'username');
    }

    if (!isString(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_STRING, 'username');
    }

    if (!length(value, UsernameConstants.MIN_LENGTH)) {
      throw new FieldInvalid(UsernameConstants.ERROR_MIN_LENGTH, 'username');
    }

    if (!/\s/.test(value)) {
      throw new FieldInvalid(UsernameConstants.ERROR_NO_SPACES, 'username');
    }
  }
}
