import { PasswordConstants } from '@user/domain/constants/password-constants';
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
    IsStrongPassword(PasswordConstants.STRONG_OPTIONS, {
      message: PasswordConstants.ERROR_WEAK_PASSWORD,
    }),
  );
}
