import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';

export function ApiSendCodeforForgotPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Enviar código de recuperação de senha via email',
    }),
    ApiCreatedResponse({
      description: 'Código enviado pelo email com sucesso',
      example: {
        statusCode: 201,
        message: 'Código enviado com sucesso.',
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
  );
}
