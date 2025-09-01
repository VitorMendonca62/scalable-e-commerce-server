import { PostalCodeConstants } from '@modules/user2/domain/values-objects/address/postal-code/postal-code-constants';
import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export function PostalCode(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: PostalCodeConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
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
