import { NumberConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiNumber() {
  return applyDecorators(
    ApiProperty({
      description: NumberConstants.DESCRIPTION,
      example: NumberConstants.EXEMPLE,
      required: true,
      minLength: NumberConstants.MIN_LENGTH,
      maxLength: NumberConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
