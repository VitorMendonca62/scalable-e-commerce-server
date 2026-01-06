import { StreetConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function Street() {
  return applyDecorators(
    IsNotEmpty({
      message: StreetConstants.ERROR_REQUIRED,
    }),
    IsString({ message: StreetConstants.ERROR_STRING }),
    MinLength(StreetConstants.MIN_LENGTH, {
      message: StreetConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(StreetConstants.MAX_LENGTH, {
      message: StreetConstants.ERROR_TOO_LONG,
    }),
  );
}
