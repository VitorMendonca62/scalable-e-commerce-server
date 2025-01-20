import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiPassword(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description:
        'A senha, que será criptografada assim que entra no sistema é utilizada para entrar no sistema. Ela deve conter um caracter especial, um número uma letra maiúscula e outra minúscula.',
      example: '$Vh1234567',
      required: required,
    }),
  );
}
