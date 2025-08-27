import { IDConstants } from '@modules/user2/domain/values-objects/uuid/id-constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
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
      description: IDConstants.DESCRIPTION,
      example: IDConstants.EXEMPLE,
      name: "id",
      required: true,
      allowEmptyValue: false,
    }),
    ApiNotFoundResponse({
      description: 'Usuário não foi encontrado',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {},
        message: 'Não foi possivel encontrar o usuário',
      },
      type: HttpResponseOutbound,
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
    ApiNotFoundResponse({
      description: 'Usuário não foi encontrado',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {},
        message: 'Não foi possivel encontrar o usuário',
      },
      type: HttpResponseOutbound,
    }),
  );
}

