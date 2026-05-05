import { PriceConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export function Price() {
  return applyDecorators(
    IsNotEmpty({
      message: PriceConstants.ERROR_REQUIRED,
    }),
    Transform(({ value }) => (value === null ? NaN : value)),
    IsNumber(
      {
        allowInfinity: false,
        allowNaN: false,
      },
      {
        message: PriceConstants.ERROR_NUMBER,
      },
    ),
    Type(() => Number),
    IsInt({
      message: PriceConstants.ERROR_INTEGER,
    }),
    Min(PriceConstants.MIN_VALUE, {
      message: PriceConstants.ERROR_MIN_VALUE,
    }),
    Max(PriceConstants.MAX_VALUE, {
      message: PriceConstants.ERROR_MAX_VALUE,
    }),
  );
}
