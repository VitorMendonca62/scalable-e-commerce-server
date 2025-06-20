import { isNotEmpty, isString, isStrongPassword } from 'class-validator';
import { PasswordConstants } from './PasswordConstants';

export class PasswordValidator {
  static isValid(value: string, isStrongPasswordClient: boolean): boolean {
    const isStrongPasswordValid = isStrongPasswordClient
      ? isStrongPassword(value, {
          minLowercase: 1,
          minSymbols: 1,
          minUppercase: 1,
          minNumbers: 1,
        })
      : true;

    return (
      isNotEmpty(value) &&
      isString(value) &&
      value.length >= PasswordConstants.MIN_LENGTH &&
      isStrongPasswordValid
    );
  }
}
