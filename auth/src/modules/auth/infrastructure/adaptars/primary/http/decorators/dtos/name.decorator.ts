import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { NameConstants } from '@modules/auth/domain/values-objects/name/NameConstants';

export function Name(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: NameConstants.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequired,
    IsString({ message: NameConstants.ERROR_INVALID }),
    MinLength(NameConstants.MIN_LENGTH, {
      message: NameConstants.ERROR_MIN_LENGTH,
    }),
  );
}
