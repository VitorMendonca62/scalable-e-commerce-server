import { applyDecorators } from '@nestjs/common';
import { CategoryConstants } from '@product/domain/values-objects/constants';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export function Category() {
  return applyDecorators(
    IsNotEmpty({
      message: CategoryConstants.ERROR_REQUIRED,
    }),
    IsString({
      message: CategoryConstants.ERROR_STRING,
    }),
    IsUUID('all', {
      message: CategoryConstants.ERROR_INVALID,
    }),
  );
}
