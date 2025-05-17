import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import PasswordVO from '@modules/auth/core/domain/types/values-objects/password.vo';

export function Password(isStrongPassword: boolean) {
  const decorators = [];

  if (isStrongPassword) {
    decorators.push(
      IsStrongPassword(
        {
          minLowercase: 1,
          minLength: PasswordVO.MIN_LENGTH,
          minSymbols: 1,
          minUppercase: 1,
          minNumbers: 1,
        },
        {
          message: PasswordVO.ERROR_WEAK_PASSWORD,
        },
      ),
    );
  }

  return applyDecorators(
    IsNotEmpty({
      message: PasswordVO.ERROR_REQUIRED,
    }),
    IsString({ message: PasswordVO.ERROR_INVALID }),
    MinLength(PasswordVO.MIN_LENGTH, {
      message: PasswordVO.ERROR_MIN_LENGTH,
    }),
    ...decorators,
  );
}
