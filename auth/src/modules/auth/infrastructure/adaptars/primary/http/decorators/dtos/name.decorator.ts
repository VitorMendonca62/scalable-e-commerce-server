import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { NameConstants } from '@modules/auth/domain/values-objects/name/name-constants';

export function Name() {
  return applyDecorators(
    IsNotEmpty({
      message: NameConstants.ERROR_REQUIRED,
    }),
    IsString({ message: NameConstants.ERROR_STRING }),
    MinLength(NameConstants.MIN_LENGTH, {
      message: NameConstants.ERROR_MIN_LENGTH,
    }),
  );
}
