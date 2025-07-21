import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiEmail(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: EmailConstants.DESCRIPTION,
      example: EmailConstants.EXEMPLE,
      required: required,
      type: 'string',
    }),
  );
}
