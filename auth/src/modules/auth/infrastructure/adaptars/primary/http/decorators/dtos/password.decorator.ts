import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { addPrefix } from '@auth/infrastructure/helpers/tests/string-helper';
import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export function Password(type: 'default' | 'new' | 'old' = 'default') {
  return applyDecorators(
    IsNotEmpty({
      message: addPrefix(PasswordConstants.ERROR_REQUIRED, type),
    }),
    IsString({ message: addPrefix(PasswordConstants.ERROR_STRING, type) }),
    MinLength(PasswordConstants.MIN_LENGTH, {
      message: addPrefix(PasswordConstants.ERROR_MIN_LENGTH, type),
    }),
    IsStrongPassword(
      {
        minLowercase: 1,
        minLength: PasswordConstants.MIN_LENGTH,
        minSymbols: 1,
        minUppercase: 1,
        minNumbers: 1,
      },
      {
        message: addPrefix(PasswordConstants.ERROR_WEAK_PASSWORD, type),
      },
    ),
  );
}
