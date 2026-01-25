import { StateConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiState() {
  return applyDecorators(
    ApiProperty({
      description: StateConstants.DESCRIPTION,
      example: StateConstants.EXEMPLE,
      required: true,
      minLength: StateConstants.LENGTH,
      maxLength: StateConstants.LENGTH,
      type: 'string',
    }),
  );
}
