import { PasswordConstants } from '@auth/domain/values-objects/constants';
import { addPrefix } from '@auth/infrastructure/helpers/string-helper';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export function Password(type: 'default' | 'new' | 'old' = 'default') {
  return applyDecorators(
    IsNotEmpty({
      message: addPrefix(PasswordConstants.ERROR_REQUIRED, type),
    }),
    IsString({ message: addPrefix(PasswordConstants.ERROR_STRING, type) }),
    MinLength(PasswordConstants.MIN_LENGTH, {
      message: addPrefix(PasswordConstants.ERROR_MIN_LENGTH, type),
    }),
  );
}
