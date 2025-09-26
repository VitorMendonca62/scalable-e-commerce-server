import { NameConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiName() {
  return applyDecorators(
    ApiProperty({
      description: NameConstants.DESCRIPTION,
      example: NameConstants.EXEMPLE,
      required: true,
      minLength: NameConstants.MIN_LENGTH,
      type: 'string',
    }),
  );
}
