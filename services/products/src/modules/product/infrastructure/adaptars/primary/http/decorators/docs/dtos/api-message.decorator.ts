import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiMessage(example: string = 'Mensagem de sucesso/erro') {
  return applyDecorators(
    ApiProperty({
      description: 'Mensagem a ser apresentada ao usuário',
      example,
      required: true,
      type: 'string',
    }),
  );
}
