import { PhoneNumberConstants } from '@modules/user2/domain/values-objects/user/phone-number/phone-number-constants';
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
