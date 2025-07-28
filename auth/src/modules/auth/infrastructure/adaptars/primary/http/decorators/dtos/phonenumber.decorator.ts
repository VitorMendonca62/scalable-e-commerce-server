import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { PhoneNumberConstants } from '@modules/auth/domain/values-objects/phone-number/phone-number-constants';

export function PhoneNumber() {
  return applyDecorators(
    IsNotEmpty({
      message: PhoneNumberConstants.ERROR_REQUIRED,
    }),
    IsString({ message: PhoneNumberConstants.ERROR_STRING }),
    Length(PhoneNumberConstants.LENGTH, PhoneNumberConstants.LENGTH, {
      message: PhoneNumberConstants.ERROR_LENGTH,
    }),
    IsPhoneNumber('BR', { message: PhoneNumberConstants.ERROR_INVALID }),
  );
}
