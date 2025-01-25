import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deletar um usuário por id',
    }),
    ApiParam({
      description: 'Deletar o usuáro pelo id',
      name: 'id',
      example: 'edd2023d-bf54-4185-b50f-9b4c08db82d4',
      required: true,
      allowEmptyValue: false,
    }),
    ApiOkResponse({
      description: 'Foi possivel deletar usuário',
    }),
    ApiNotFoundResponse({
      description:
        'Não foi possivel encontrar o usuário ou não foi passado o id',
    }),
  );
}
