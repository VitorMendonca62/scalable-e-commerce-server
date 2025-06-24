import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PasswordConstants } from '@modules/auth/domain/values-objects/password/PasswordConstants';

export function ApiPassword(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: PasswordConstants.DESCRIPTION,
      example: PasswordConstants.EXEMPLE,
      required: required,
      minLength: PasswordConstants.MIN_LENGTH,
      type: required ? 'string' : 'null',
    }),
  );
}
