import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { PhoneNumberConstants } from '@modules/auth/domain/values-objects/phonumber/PhoneNumberConstants';

export function PhoneNumber(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: PhoneNumberConstants.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequired,
    IsString({ message: PhoneNumberConstants.ERROR_STRING }),
    Length(PhoneNumberConstants.LENGTH, PhoneNumberConstants.LENGTH),
    IsPhoneNumber('BR', { message: PhoneNumberConstants.ERROR_INVALID }),
  );
}
