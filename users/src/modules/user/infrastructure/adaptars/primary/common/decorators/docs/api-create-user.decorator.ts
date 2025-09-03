import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { EmailConstants } from '@user/domain/values-objects/user/email/email-constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar usuário',
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
        data: 'email',
        message: EmailConstants.ERROR_INVALID,
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
  );
}
