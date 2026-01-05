import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiData(example: object = {}) {
  return applyDecorators(
    ApiProperty({
      description:
        'Dados retornado pela API, pode ser dados do usuário, tokens, erros e etc.',
      example,
      required: true,
    }),
  );
}
