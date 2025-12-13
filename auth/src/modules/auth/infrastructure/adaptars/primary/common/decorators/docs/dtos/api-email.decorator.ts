import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
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
