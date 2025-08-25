import { PhoneNumberConstants } from '@modules/user2/domain/values-objects/user/phone-number/phone-number-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

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
