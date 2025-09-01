import { NameConstants } from '@modules/user2/domain/values-objects/user/name/name-constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export function Name(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: NameConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: NameConstants.ERROR_STRING }),
    MinLength(NameConstants.MIN_LENGTH, {
      message: NameConstants.ERROR_MIN_LENGTH,
    }),
  );
}
