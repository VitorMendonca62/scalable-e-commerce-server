import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';

export function ApiSendCodeforForgotPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Enviar código de recuperação de senha via email',
    }),
    ApiOkResponse({
      description: 'Código enviado pelo email com sucesso',
      example: {
        statusCode: HttpStatus.OK,
        message:
          'Código de recuperação enviado com sucesso. Verifique seu email.',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Algum campo está inválido',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: 'email',
        message: 'O email deve ser válido',
      },
      type: HttpResponseOutbound,
    }),
    ApiServiceUnavailableResponse({
      description: 'O serviço de email está inoperante ou deu algum erro',
      example: {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message:
          'Erro ao comunicar com serviço de email. Tente novamente mais tarde',
      },
      type: HttpResponseOutbound,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Erro interno ao enviar o código de recuperação',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      },
      type: HttpResponseOutbound,
    }),
  );
}
