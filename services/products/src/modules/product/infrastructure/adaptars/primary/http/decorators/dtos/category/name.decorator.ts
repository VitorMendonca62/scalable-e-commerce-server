import { applyDecorators } from '@nestjs/common';
import CategoryNameConstants from '@product/domain/values-objects/category/name/name.constants';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function CategoryName() {
  return applyDecorators(
    IsNotEmpty({
      message: CategoryNameConstants.ERROR_REQUIRED,
    }),
    IsString({
      message: CategoryNameConstants.ERROR_STRING,
    }),
    MinLength(3, {
      message: CategoryNameConstants.ERROR_MIN_LENGTH,
    }),
    MaxLength(100, {
      message: CategoryNameConstants.ERROR_MAX_LENGTH,
    }),
  );
}
