import { PasswordConstants } from '@user/domain/values-objects/user/password/password-constants';
import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export function Password(isStrongPassword: boolean) {
  const decorators = [];

  if (isStrongPassword) {
    decorators.push(
      IsStrongPassword(PasswordConstants.STRONG_OPTIONS, {
        message: PasswordConstants.ERROR_WEAK_PASSWORD,
      }),
    );
  }

  return applyDecorators(
    IsNotEmpty({
      message: PasswordConstants.ERROR_REQUIRED,
    }),
    IsString({ message: PasswordConstants.ERROR_STRING }),
    MinLength(PasswordConstants.MIN_LENGTH, {
      message: PasswordConstants.ERROR_MIN_LENGTH,
    }),
    ...decorators,
  );
}
