import { PhoneNumberConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export function PhoneNumber(required: boolean) {
  const IsRequired = required
    ? IsNotEmpty({
        message: PhoneNumberConstants.ERROR_REQUIRED,
      })
    : IsOptional();

  return applyDecorators(
    IsRequired,
    IsString({ message: PhoneNumberConstants.ERROR_STRING }),
    Length(PhoneNumberConstants.LENGTH, PhoneNumberConstants.LENGTH, {
      message: PhoneNumberConstants.ERROR_LENGTH,
    }),
    IsPhoneNumber('BR', { message: PhoneNumberConstants.ERROR_INVALID }),
  );
}
