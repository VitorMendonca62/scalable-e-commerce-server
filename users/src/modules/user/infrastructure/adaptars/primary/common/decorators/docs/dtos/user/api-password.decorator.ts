import { PasswordConstants } from '@user/domain/constants/password-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPassword() {
  return applyDecorators(
    ApiProperty({
      description: PasswordConstants.DESCRIPTION,
      example: PasswordConstants.EXEMPLE,
      required: true,
      minLength: PasswordConstants.MIN_LENGTH,
      type: 'string',
    }),
  );
}
