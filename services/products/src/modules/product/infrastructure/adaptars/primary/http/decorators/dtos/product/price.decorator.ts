import { PriceConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export function Price() {
  return applyDecorators(
    IsNotEmpty({
      message: PriceConstants.ERROR_REQUIRED,
    }),
    Type(() => Number),
    IsNumber(
      {},
      {
        message: PriceConstants.ERROR_NUMBER,
      },
    ),
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
