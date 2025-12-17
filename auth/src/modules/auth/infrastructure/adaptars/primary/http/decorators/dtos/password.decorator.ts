import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export function Password() {
  return applyDecorators(
    IsNotEmpty({
      message: PasswordConstants.ERROR_REQUIRED,
    }),
    IsString({ message: PasswordConstants.ERROR_STRING }),
    MinLength(PasswordConstants.MIN_LENGTH, {
      message: PasswordConstants.ERROR_MIN_LENGTH,
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
        message: PasswordConstants.ERROR_WEAK_PASSWORD,
      },
    ),
  );
}
