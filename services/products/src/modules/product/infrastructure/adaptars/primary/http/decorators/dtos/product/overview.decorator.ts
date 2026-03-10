import { OverviewConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function Overview() {
  return applyDecorators(
    IsNotEmpty({
      message: OverviewConstants.ERROR_REQUIRED,
    }),
    IsString({
      message: OverviewConstants.ERROR_STRING,
    }),
    MinLength(OverviewConstants.MIN_LENGTH, {
      message: OverviewConstants.ERROR_MIN_LENGTH,
    }),
    MaxLength(OverviewConstants.MAX_LENGTH, {
      message: OverviewConstants.ERROR_MAX_LENGTH,
    }),
  );
}
