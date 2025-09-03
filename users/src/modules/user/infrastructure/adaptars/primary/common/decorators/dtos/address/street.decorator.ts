import { StreetConstants } from '@user/domain/values-objects/address/street/street-constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export function Street(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: StreetConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: StreetConstants.ERROR_STRING }),
    MinLength(StreetConstants.MIN_LENGTH, {
      message: StreetConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(StreetConstants.MAX_LENGTH, {
      message: StreetConstants.ERROR_TOO_LONG,
    }),
  );
}
