import { ActiveConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export function Active() {
  return applyDecorators(
    IsNotEmpty({
      message: ActiveConstants.ERROR_REQUIRED,
    }),
    IsBoolean({
      message: ActiveConstants.ERROR_BOOLEAN,
    }),
  );
}
