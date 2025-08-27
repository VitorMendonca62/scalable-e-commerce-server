import { HttpResponseOutbound } from '@modules/user2/domain/ports/primary/http/sucess.port';
import { IDConstants } from '@modules/user2/domain/values-objects/uuid/id-constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
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
      example: IDConstants.EXEMPLE,
      required: true,
      allowEmptyValue: false,
    }),
    ApiOkResponse({
      description: 'Foi possivel deletar usuário',
      example: {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Usuário deletado com sucesso',
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
