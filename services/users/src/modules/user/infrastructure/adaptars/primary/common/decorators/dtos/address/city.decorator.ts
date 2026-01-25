import CityConstants from '@user/domain/values-objects/address/city/city-constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function City() {
  return applyDecorators(
    IsNotEmpty({
      message: CityConstants.ERROR_REQUIRED,
    }),
    IsString({ message: CityConstants.ERROR_STRING }),
    MinLength(CityConstants.MIN_LENGTH, {
      message: CityConstants.ERROR_TOO_SHORT,
    }),
    MaxLength(CityConstants.MAX_LENGTH, {
      message: CityConstants.ERROR_TOO_LONG,
    }),
  );
}
