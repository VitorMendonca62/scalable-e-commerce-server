import { PasswordConstants } from '@modules/user2/domain/values-objects/user/password/password-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPassword(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: PasswordConstants.DESCRIPTION,
      example: PasswordConstants.EXEMPLE,
      required: required,
      minLength: PasswordConstants.MIN_LENGTH,
      type: 'string',
    }),
  );
}
