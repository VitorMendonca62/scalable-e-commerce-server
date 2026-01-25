import { PhoneNumberConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

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
