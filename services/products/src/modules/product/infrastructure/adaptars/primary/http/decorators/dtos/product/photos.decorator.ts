import { PhotosConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import {
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsBase64,
} from 'class-validator';

export function Photos() {
  return applyDecorators(
    IsNotEmpty({
      message: PhotosConstants.ERROR_REQUIRED,
    }),
    IsArray({
      message: PhotosConstants.ERROR_ARRAY,
    }),
    ArrayMinSize(1, {
      message: PhotosConstants.ERROR_MIN_LENGTH,
    }),
    ArrayMaxSize(10, {
      message: PhotosConstants.ERROR_MAX_LENGTH,
    }),
    IsBase64(
      {},
      {
        each: true,
        message: PhotosConstants.ERROR_INVALID_URL,
      },
    ),
  );
}
