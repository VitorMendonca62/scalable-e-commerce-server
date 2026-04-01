import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Realizar o logou do usuário, revogando seu token.',
    }),
    ApiCookieAuth('cookie_refresh'),
    ApiNoContentResponse({
      description: 'O logout teve sucesso.',
    }),
    ApiUnauthorizedResponse({
      description: 'Token inválido ou expirado',
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido ou expirado',
      },
      type: HttpResponseOutbound,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Erro interno ao realizar logout',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      },
      type: HttpResponseOutbound,
    }),
  );
}
