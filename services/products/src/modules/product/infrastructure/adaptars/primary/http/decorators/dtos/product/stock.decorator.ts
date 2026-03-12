import { StockConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export function Stock() {
  return applyDecorators(
    IsNotEmpty({
      message: StockConstants.ERROR_REQUIRED,
    }),
    Type(() => Number),
    IsNumber(
      {},
      {
        message: StockConstants.ERROR_NUMBER,
      },
    ),
    IsInt({
      message: StockConstants.ERROR_INTEGER,
    }),
    Min(StockConstants.MIN_VALUE, {
      message: StockConstants.ERROR_MIN_VALUE,
    }),
    Max(StockConstants.MAX_VALUE, {
      message: StockConstants.ERROR_MAX_VALUE,
    }),
  );
}
