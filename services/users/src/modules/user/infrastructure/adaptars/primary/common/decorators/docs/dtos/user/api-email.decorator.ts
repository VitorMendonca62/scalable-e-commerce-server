import { EmailConstants } from '@modules/user/domain/values-objects/user/constants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiEmail() {
  return applyDecorators(
    ApiProperty({
      description: EmailConstants.DESCRIPTION,
      example: EmailConstants.EXEMPLE,
      required: true,
      type: 'string',
    }),
  );
}
