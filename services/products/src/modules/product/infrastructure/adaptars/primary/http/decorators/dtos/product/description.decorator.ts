import { DescriptionConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function Description() {
  return applyDecorators(
    IsNotEmpty({
      message: DescriptionConstants.ERROR_REQUIRED,
    }),
    IsString({
      message: DescriptionConstants.ERROR_STRING,
    }),
    MinLength(DescriptionConstants.MIN_LENGTH, {
      message: DescriptionConstants.ERROR_MIN_LENGTH,
    }),
    MaxLength(DescriptionConstants.MAX_LENGTH, {
      message: DescriptionConstants.ERROR_MAX_LENGTH,
    }),
  );
}
