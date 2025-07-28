import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumberConstants } from '@modules/auth/domain/values-objects/phone-number/phone-number-constants';

export function ApiPhoneNumber(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: PhoneNumberConstants.DESCRIPTION,
      example: PhoneNumberConstants.EXEMPLE,
      required: required,
      type: 'string',
    }),
  );
}
