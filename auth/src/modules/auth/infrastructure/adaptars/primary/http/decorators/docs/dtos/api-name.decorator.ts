import { NameConstants } from '@modules/auth/domain/values-objects/name/name-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiName(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: NameConstants.DESCRIPTION,
      example: NameConstants.EXEMPLE,
      required: required,
      minLength: NameConstants.MIN_LENGTH,
      type: 'string',
    }),
  );
}
