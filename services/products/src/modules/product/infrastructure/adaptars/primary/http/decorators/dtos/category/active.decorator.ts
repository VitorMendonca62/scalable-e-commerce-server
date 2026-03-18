import { applyDecorators } from '@nestjs/common';
import CategoryActiveConstants from '@product/domain/values-objects/category/active/active.constants';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export function CategoryActive() {
  return applyDecorators(
    IsNotEmpty({
      message: CategoryActiveConstants.ERROR_REQUIRED,
    }),
    IsBoolean({
      message: CategoryActiveConstants.ERROR_BOOLEAN,
    }),
  );
}
