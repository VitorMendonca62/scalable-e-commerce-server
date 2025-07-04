import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiUsername(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: UsernameConstants.DESCRIPTION,
      example: UsernameConstants.EXEMPLE,
      required: required,
      minLength: UsernameConstants.MIN_LENGTH,
      type: required ? 'string' : 'null',
    }),
  );
}
