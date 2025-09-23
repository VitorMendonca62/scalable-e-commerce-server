import { UsernameConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export function Username(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: UsernameConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: UsernameConstants.ERROR_STRING }),
    MinLength(UsernameConstants.MIN_LENGTH, {
      message: UsernameConstants.ERROR_MIN_LENGTH,
    }),
    Matches(/^\S+$/, { message: UsernameConstants.ERROR_NO_SPACES }),
  );
}
