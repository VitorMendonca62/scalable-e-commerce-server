import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiUsername(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description:
        'O apelido serve como identificador único de usuário e é utilizado para o usuário ser identificado no sistema',
      example: 'vitormendonca62',
      required: required,
      minLength: 3,
    }),
  );
}
