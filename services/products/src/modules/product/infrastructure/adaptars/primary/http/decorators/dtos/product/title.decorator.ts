import { TitleConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export function Title() {
  return applyDecorators(
    IsNotEmpty({
      message: TitleConstants.ERROR_REQUIRED,
    }),
    IsString({
      message: TitleConstants.ERROR_STRING,
    }),
    MinLength(TitleConstants.MIN_LENGTH, {
      message: TitleConstants.ERROR_MIN_LENGTH,
    }),
    MaxLength(TitleConstants.MAX_LENGTH, {
      message: TitleConstants.ERROR_MAX_LENGTH,
    }),
  );
}
