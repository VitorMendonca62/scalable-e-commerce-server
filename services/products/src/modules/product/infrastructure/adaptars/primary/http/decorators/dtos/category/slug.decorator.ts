import { applyDecorators } from '@nestjs/common';
import CategorySlugConstants from '@product/domain/values-objects/category/slug/slug.constants';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export function CategorySlug() {
  return applyDecorators(
    IsNotEmpty({
      message: CategorySlugConstants.ERROR_REQUIRED,
    }),
    IsString({
      message: CategorySlugConstants.ERROR_STRING,
    }),
    MinLength(3, {
      message: CategorySlugConstants.ERROR_MIN_LENGTH,
    }),
    MaxLength(150, {
      message: CategorySlugConstants.ERROR_MAX_LENGTH,
    }),
    Matches(CategorySlugConstants.REGEX, {
      message: CategorySlugConstants.ERROR_INVALID_FORMAT,
    }),
  );
}
