import { UsernameConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiUsername(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: UsernameConstants.DESCRIPTION,
      example: UsernameConstants.EXEMPLE,
      required: required,
      minLength: UsernameConstants.MIN_LENGTH,
      type: 'string',
    }),
  );
}
