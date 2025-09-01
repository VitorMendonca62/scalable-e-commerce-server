import { ComplementConstants } from '@modules/user2/domain/values-objects/address/complement/complement-constants';
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
