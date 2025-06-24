import {
  isNotEmpty,
  isString,
  isStrongPassword,
  length,
} from 'class-validator';
import { PasswordConstants } from './PasswordConstants';
import { FieldInvalid } from '../../ports/primary/http/errors.port';

export class PasswordValidator {
  static isValid(value: string, isStrongPasswordClient: boolean) {
    if (!isNotEmpty(value)) {
      throw new FieldInvalid(PasswordConstants.ERROR_REQUIRED, 'password');
    }

    if (!isString(value)) {
      throw new FieldInvalid(PasswordConstants.ERROR_INVALID, 'password');
    }

    if (!length(value, PasswordConstants.MIN_LENGTH)) {
      throw new FieldInvalid(PasswordConstants.ERROR_MIN_LENGTH, 'password');
    }
    if (isStrongPasswordClient) {
      if (
        !isStrongPassword(value, {
          minLowercase: 1,
          minSymbols: 1,
          minUppercase: 1,
          minNumbers: 1,
        })
      ) {
        throw new FieldInvalid(
          PasswordConstants.ERROR_WEAK_PASSWORD,
          'password',
        );
      }
    }
  }
}
