import { PhotosConstants } from '@product/domain/values-objects/constants';
import { applyDecorators } from '@nestjs/common';
import {
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Transform } from 'class-transformer';

export function Photos() {
  return applyDecorators(
    Transform(({ value }) => {
      if (!Array.isArray(value)) {
        return value;
      }

      return value.map((item) => {
        return Buffer.isBuffer(item) ? item.toString('base64') : item;
      });
    }),
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
  );
}
