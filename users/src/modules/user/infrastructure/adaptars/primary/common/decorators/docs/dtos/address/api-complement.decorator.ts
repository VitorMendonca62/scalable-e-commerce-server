import { ComplementConstants } from '@modules/user/domain/values-objects/address/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiComplement() {
  return applyDecorators(
    ApiProperty({
      description: ComplementConstants.DESCRIPTION,
      example: ComplementConstants.EXEMPLE,
      required: false,
      maxLength: ComplementConstants.MAX_LENGTH,
      type: 'string',
    }),
  );
}
