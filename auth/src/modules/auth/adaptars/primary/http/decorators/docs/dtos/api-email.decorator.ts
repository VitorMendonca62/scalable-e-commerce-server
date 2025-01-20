import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function ApiEmail(required: boolean) {
  return applyDecorators(
    ApiProperty({
      description:
        'O email serve como identificador único de usuário e utiliza-se para entrar no sistema',
      example: 'exemple@exemple.com',
      required: required,
    }),
  );
}
