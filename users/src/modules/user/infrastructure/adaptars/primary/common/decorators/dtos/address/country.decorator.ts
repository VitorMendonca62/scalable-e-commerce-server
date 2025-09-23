import { CountryConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export function Country(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: CountryConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: CountryConstants.ERROR_STRING }),
    MinLength(CountryConstants.MIN_LENGTH, {
      message: CountryConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(CountryConstants.MAX_LENGTH, {
      message: CountryConstants.ERROR_TOO_LONG,
    }),
  );
}
