import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { IDConstants } from '@user/domain/values-objects/uuid/id-constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deletar um usuário por token',
    }),
    ApiOkResponse({
      description: 'Foi possivel deletar usuário',
      example: {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Usuário deletado com sucesso',
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'O ID no token está inválido',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: 'id',
        message: IDConstants.ERROR_INVALID,
      },
      type: HttpResponseOutbound,
    }),
    ApiNotFoundResponse({
      description: 'Não foi possivel encontrar o usuário',
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Não foi possivel encontrar o usuário',
      },
      type: HttpResponseOutbound,
    }),
  );
}
