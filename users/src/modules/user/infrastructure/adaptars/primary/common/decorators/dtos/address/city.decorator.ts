import { CityConstants } from '@user/domain/values-objects/address/city/city-constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export function City(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: CityConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: CityConstants.ERROR_STRING }),
    MinLength(CityConstants.MIN_LENGTH, {
      message: CityConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(CityConstants.MAX_LENGTH, {
      message: CityConstants.ERROR_TOO_LONG,
    }),
  );
}
