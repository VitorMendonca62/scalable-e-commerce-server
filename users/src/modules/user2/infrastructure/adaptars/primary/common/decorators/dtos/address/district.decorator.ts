import { DistrictConstants } from '@modules/user2/domain/values-objects/address/district/district-constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export function District(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: DistrictConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: DistrictConstants.ERROR_STRING }),
    MinLength(DistrictConstants.MIN_LENGTH, {
      message: DistrictConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(DistrictConstants.MAX_LENGTH, {
      message: DistrictConstants.ERROR_TOO_LONG,
    }),
  );
}
