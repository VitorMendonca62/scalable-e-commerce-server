import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
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
} from '@user/domain/values-objects/user/constants';
import { IDConstants } from '@user/domain/values-objects/common/constants';

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
      required: true,
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
          phoneNumber: PhoneNumberConstants.EXEMPLE,
        },
        message: 'Usuário encontrado com sucesso',
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
    ApiInternalServerErrorResponse({
      description: 'Não foi possivel buscar o usuário',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel buscar o usuário',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
  );
}
