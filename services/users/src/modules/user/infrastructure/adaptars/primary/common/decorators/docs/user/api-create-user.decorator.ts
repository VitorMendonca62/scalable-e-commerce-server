import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  EmailConstants,
  NameConstants,
} from '@user/domain/values-objects/user/constants';

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar usuário',
    }),
    ApiHeader({
      name: 'x-user-email',
      description: 'Email validado previamente para criar o usuário.',
      required: true,
    }),
    ApiCreatedResponse({
      description: 'Foi possivel criar usuário',
      example: {
        statusCode: HttpStatus.CREATED,
        message: 'Usuário criado com sucesso',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Erro de validação em algum campo',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: 'name',
        message: NameConstants.ERROR_REQUIRED,
      },
      type: HttpResponseOutbound,
    }),
    ApiConflictResponse({
      description: 'Email ou username já existe no banco de dados',
      example: {
        statusCode: HttpStatus.CONFLICT,
        data: 'email',
        message: EmailConstants.ERROR_ALREADY_EXISTS,
      },
      type: HttpResponseOutbound,
    }),
    ApiInternalServerErrorResponse({
      description: 'Não foi possivel criar o usuário',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel criar o usuário',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
  );
}
