import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import PhoneNumberVO from '@modules/auth/domain/values-objects/phonenumber.vo';

export function ApiPhoneNumber(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: PhoneNumberVO.DESCRIPTION,
      example: PhoneNumberVO.EXEMPLE,
      required: required,
    }),
  );
}
