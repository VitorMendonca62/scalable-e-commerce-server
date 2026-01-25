import { CountryConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function Country() {
  return applyDecorators(
    IsNotEmpty({
      message: CountryConstants.ERROR_REQUIRED,
    }),
    IsString({ message: CountryConstants.ERROR_STRING }),
    MinLength(CountryConstants.MIN_LENGTH, {
      message: CountryConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(CountryConstants.MAX_LENGTH, {
      message: CountryConstants.ERROR_TOO_LONG,
    }),
  );
}
