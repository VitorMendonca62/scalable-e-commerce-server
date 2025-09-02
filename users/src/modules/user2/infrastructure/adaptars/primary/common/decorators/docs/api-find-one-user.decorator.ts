import { HttpResponseOutbound } from '@modules/user2/domain/ports/primary/http/sucess.port';
import { UsernameConstants } from '@modules/user2/domain/values-objects/user/username/username-constants';
import { IDConstants } from '@modules/user2/domain/values-objects/uuid/id-constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
      description: IDConstants.DESCRIPTION,
      example: IDConstants.EXEMPLE,
      required: false,
    }),
    ApiQuery({
      name: 'username',
      description: UsernameConstants.DESCRIPTION,
      example: UsernameConstants.EXEMPLE,
      required: false,
    }),
    ApiOkResponse({
      description: 'Conseguiu encontrar um usuário',
      example: {
        statusCode: HttpStatus.OK,
        data: {},
        message: 'Aqui está usuário pelo ID',
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Username ou id está inválido.',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: 'id',
        message: IDConstants.ERROR_INVALID,
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
