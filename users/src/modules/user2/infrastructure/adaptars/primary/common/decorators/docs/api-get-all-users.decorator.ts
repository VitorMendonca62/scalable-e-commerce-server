import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';

export function ApiGetAllUsers() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar todos usuários',
    }),
    ApiOkResponse({
      description: 'Retorna todos os usuários',
    }),
    ApiNotFoundResponse({
      description: 'Não existe algum usuário cadastrado no sistema',
    }),
  );
}
