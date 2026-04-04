import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { EmailConstants } from '@user/domain/values-objects/user/constants';

export function ApiValidateEmail() {
  return applyDecorators(
    ApiOperation({
      summary: 'Enviar código de validação por email',
    }),
    ApiOkResponse({
      description: 'Código enviado com sucesso para o email informado',
      example: {
        statusCode: HttpStatus.OK,
        message: 'Código enviado com sucesso para seu email.',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Erro de validação no email',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: 'email',
        message: EmailConstants.ERROR_REQUIRED,
      },
      type: HttpResponseOutbound,
    }),
    ApiInternalServerErrorResponse({
      description: 'Não foi possivel enviar o código de validação',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel enviar o código de validação.',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
  );
}
