import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import NameVO from '@modules/auth/domain/values-objects/name.vo';

export function Name(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: NameVO.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequired,
    IsString({ message: NameVO.ERROR_INVALID }),
    MinLength(NameVO.MIN_LENGTH, {
      message: NameVO.ERROR_MIN_LENGTH,
    }),
  );
}
