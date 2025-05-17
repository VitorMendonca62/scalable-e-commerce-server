import EmailVO from '@modules/auth/domain/values-objects/email.vo';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiEmail(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description: EmailVO.DESCRIPTION,
      example: EmailVO.EXEMPLE,
      required: required,
    }),
  );
}
