import { StateConstants } from '@user/domain/values-objects/address/state/state-constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiState(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: StateConstants.DESCRIPTION,
      example: StateConstants.EXEMPLE,
      required: required,
      minLength: StateConstants.MIN_LENGTH,
      maxLength: StateConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
