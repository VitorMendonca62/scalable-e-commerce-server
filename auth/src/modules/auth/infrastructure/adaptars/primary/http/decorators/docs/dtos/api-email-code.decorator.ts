import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiEmailCode() {
  return applyDecorators(
    ApiProperty({
      description: 'Código de verificação enviado por e-mail',
      example: '123456',
      minLength: 6,
      maxLength: 6,
    }),
  );
}
