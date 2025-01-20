import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPhoneNumber(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description:
        'O número de telefone serve como informação auxiliar para o sistema. Deve ser um número válido no Brasil!.',
      example: '+5581999999999',
      required: required,
    }),
  );
}
