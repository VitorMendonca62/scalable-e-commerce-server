import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import PhoneNumberVO from '@modules/auth/core/domain/types/values-objects/phonenumber.vo';

export function PhoneNumber(isOptional: boolean) {
  const IsRequired = isOptional
    ? IsOptional()
    : IsNotEmpty({
        message: PhoneNumberVO.ERROR_REQUIRED,
      });

  return applyDecorators(
    IsRequired,
    IsPhoneNumber('BR', { message: PhoneNumberVO.ERROR_INVALID }),
    IsString({ message: PhoneNumberVO.ERROR_STRING }),
  );
}
