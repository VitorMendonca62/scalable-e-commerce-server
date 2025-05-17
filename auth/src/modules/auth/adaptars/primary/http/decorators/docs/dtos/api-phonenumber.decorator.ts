import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import PhoneNumberVO from '@modules/auth/core/domain/types/values-objects/phonenumber.vo';

export function ApiPhoneNumber(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: PhoneNumberVO.DESCRIPTION,
      example: PhoneNumberVO.EXEMPLE,
      required: required,
    }),
  );
}
