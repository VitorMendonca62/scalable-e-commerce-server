import { NumberConstants } from '@modules/user/domain/values-objects/address/constants';
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
