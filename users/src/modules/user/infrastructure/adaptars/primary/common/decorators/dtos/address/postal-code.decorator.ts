import { PostalCodeConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

export function PostalCode() {
  return applyDecorators(
    IsNotEmpty({
      message: PostalCodeConstants.ERROR_REQUIRED,
    }),
    IsString({ message: PostalCodeConstants.ERROR_STRING }),
    Length(PostalCodeConstants.LENGTH, PostalCodeConstants.LENGTH, {
      message: PostalCodeConstants.ERROR_LENGTH,
    }),
    IsNumberString(
      { no_symbols: true },
      {
        message: PostalCodeConstants.ERROR_INVALID,
      },
    ),
  );
}
