import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  AvatarConstants,
  NameConstants,
  PhoneNumberConstants,
  UsernameConstants,
} from '@user/domain/values-objects/user/constants';

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar um usuário por token',
    }),
    ApiHeader({
      name: 'x-user-id',
      description: 'ID do usuário autenticado para atualização.',
      required: true,
    }),
    ApiOkResponse({
      description: 'Foi possivel atualizar usuário',
      example: {
        statusCode: HttpStatus.OK,
        data: {
          name: NameConstants.EXEMPLE,
          username: UsernameConstants.EXEMPLE,
          avatar: AvatarConstants.EXEMPLE,
          phoneNumber: PhoneNumberConstants.EXEMPLE,
        },
        message: 'Usuário atualizado com sucesso',
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Erro de validação em algum campo ou nenhum campo enviado',
      examples: {
        emptyPayload: {
          summary: 'Nenhum campo enviado',
          value: {
            statusCode: HttpStatus.BAD_REQUEST,
            data: 'all',
            message: 'Adicione algum campo para o usuário ser atualizado',
          },
        },
        avatarInvalid: {
          summary: 'Avatar inválido',
          value: {
            statusCode: HttpStatus.BAD_REQUEST,
            data: 'avatar',
            message: AvatarConstants.ERROR_INVALID,
          },
        },
      },
      type: HttpResponseOutbound,
    }),
    ApiConflictResponse({
      description: 'Username já existe no banco de dados',
      example: {
        statusCode: HttpStatus.CONFLICT,
        data: 'username',
        message: UsernameConstants.ERROR_ALREADY_EXISTS,
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
    ApiInternalServerErrorResponse({
      description: 'Não foi possivel atualizar o usuário',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel atualizar o usuário',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
  );
}
