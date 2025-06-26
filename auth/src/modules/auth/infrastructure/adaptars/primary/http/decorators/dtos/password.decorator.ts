import { PasswordConstants } from '@modules/auth/domain/values-objects/password/PasswordConstants';
import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export function Password(isStrongPassword: boolean, isOptional: boolean) {
  const decorators = [];

  if (isStrongPassword) {
    decorators.push(
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

  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: PasswordConstants.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequired,
    IsString({ message: PasswordConstants.ERROR_STRING }),
    MinLength(PasswordConstants.MIN_LENGTH, {
      message: PasswordConstants.ERROR_MIN_LENGTH,
    }),
    ...decorators,
  );
}
