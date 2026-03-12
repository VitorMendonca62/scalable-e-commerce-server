import { ActiveConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export function Active() {
  return applyDecorators(
    IsNotEmpty({
      message: ActiveConstants.ERROR_REQUIRED,
    }),
    Type(() => Boolean),
    IsBoolean({
      message: ActiveConstants.ERROR_BOOLEAN,
    }),
  );
}
