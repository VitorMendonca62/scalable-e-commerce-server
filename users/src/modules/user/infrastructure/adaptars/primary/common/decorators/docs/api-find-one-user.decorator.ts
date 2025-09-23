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
import {
  UsernameConstants,
  NameConstants,
  EmailConstants,
  AvatarConstants,
  PhoneNumberConstants,
} from '@modules/user/domain/values-objects/user/constants';

export function ApiFindOneUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Pesquisar um usuário por username ou id',
    }),
    ApiParam({
      name: 'identifier',
      description:
        'Informe o identificador único (UUID) do usuário ou o username para realizar a busca.',
      examples: {
        username: {
          summary: 'username',
          value: UsernameConstants.EXEMPLE,
        },
        id: {
          summary: 'id',
          value: IDConstants.EXEMPLE,
        },
      },
      required: false,
    }),
    ApiOkResponse({
      description: 'Conseguiu encontrar um usuário',
      example: {
        statusCode: HttpStatus.OK,
        data: {
          name: NameConstants.EXEMPLE,
          username: UsernameConstants.EXEMPLE,
          email: EmailConstants.EXEMPLE,
          avatar: AvatarConstants.EXEMPLE,
          phonenumber: PhoneNumberConstants.EXEMPLE,
        },
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
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Não foi possivel encontrar o usuário',
      },
      type: HttpResponseOutbound,
    }),
  );
}
