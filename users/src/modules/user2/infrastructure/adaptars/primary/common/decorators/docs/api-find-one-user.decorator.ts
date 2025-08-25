import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

export function ApiFindOneUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Pesquisar um usuário por username ou id',
    }),
    ApiQuery({
      name: 'id',
      description: 'Pesquisar por ID único de usuário',
      example: 'edd2023d-bf54-4185-b50f-9b4c08db82d4',
      required: false,
    }),
    ApiQuery({
      name: 'username',
      description: 'Pesquisar por username de usuário',
      example: 'vitormendonca62',
      required: false,
    }),
    ApiOkResponse({
      description: 'Conseguiu encontrar um usuário',
    }),
    ApiNotFoundResponse({
      description: 'Usuário não foi encontrado',
    }),
  );
}
