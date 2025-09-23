import { NumberConstants } from '@user/domain/values-objects/address/number/number-constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export function Number(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: NumberConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: NumberConstants.ERROR_STRING }),
    MaxLength(NumberConstants.MAX_LENGTH, {
      message: NumberConstants.ERROR_TOO_LONG,
    }),
  );
}
