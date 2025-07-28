import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/username-constants';

export function Username() {
  return applyDecorators(
    IsNotEmpty({
      message: UsernameConstants.ERROR_REQUIRED,
    }),
    IsString({ message: UsernameConstants.ERROR_STRING }),
    MinLength(UsernameConstants.MIN_LENGTH, {
      message: UsernameConstants.ERROR_MIN_LENGTH,
    }),
    Matches(/^\S+$/, { message: UsernameConstants.ERROR_NO_SPACES }),
  );
}
