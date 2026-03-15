import { ActiveConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export function Active() {
  return applyDecorators(
    IsNotEmpty({
      message: ActiveConstants.ERROR_REQUIRED,
    }),
    Transform(({ value }) => {
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      return '.';
    }),
    IsBoolean({
      message: ActiveConstants.ERROR_BOOLEAN,
    }),
  );
}
