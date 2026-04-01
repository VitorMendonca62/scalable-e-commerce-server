import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { PasswordConstants } from '@auth/domain/values-objects/constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resetar senha do usuário',
    }),
    ApiCookieAuth('cookie_reset_pass'),
    ApiOkResponse({
      description: 'Usuário conseguiu resetar a senha com sucesso',
      example: {
        statusCode: HttpStatus.OK,
        message: 'Senha atualizada com sucesso',
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Algum campo está inválido',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PasswordConstants.ERROR_REQUIRED,
        data: 'oldPassword',
      },
      type: HttpResponseOutbound,
    }),
    ApiUnauthorizedResponse({
      description: 'O usuário não existe.',
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido ou expirado',
      },
      type: HttpResponseOutbound,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Erro interno ao resetar a senha do usuário',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      },
      type: HttpResponseOutbound,
    }),
  );
}
