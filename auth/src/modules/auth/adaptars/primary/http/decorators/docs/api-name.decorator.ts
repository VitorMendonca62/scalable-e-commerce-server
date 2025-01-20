import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiName(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description:
        'O nome completo do usuário. Serve como informação auxiliar para o sistema',
      minLength: 3,
      example: 'Vitor Hugo Mendonça de Queiroz',
      required: required,
    }),
  );
}
