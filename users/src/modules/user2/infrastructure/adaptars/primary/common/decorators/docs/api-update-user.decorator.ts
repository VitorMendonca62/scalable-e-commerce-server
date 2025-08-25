import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar um usuário por id',
    }),
    ApiParam({
      description: 'Atualizar o usuáro pelo id',
      name: 'id',
      example: 'edd2023d-bf54-4185-b50f-9b4c08db82d4',
      required: true,
      allowEmptyValue: false,
    }),
    ApiOkResponse({
      description: 'Foi possivel atualizar usuário',
    }),
    ApiBadRequestResponse({
      description: 'Não passou nenhum campo para o usuário ser atualizado',
    }),
    ApiNotFoundResponse({
      description:
        'Não foi possivel encontrar o usuário ou não foi passado o id',
    }),
  );
}
