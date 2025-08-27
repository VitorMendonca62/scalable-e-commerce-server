import { HttpResponseOutbound } from '@modules/user2/domain/ports/primary/http/sucess.port';
import { UsernameConstants } from '@modules/user2/domain/values-objects/user/username/username-constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
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
      example: UsernameConstants.EXEMPLE,
      required: false,
    }),
    ApiOkResponse({
      description: 'Conseguiu encontrar um usuário',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: {},
        message: 'Aqui está usuário pelo ID',
      },
      type: HttpResponseOutbound,
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
