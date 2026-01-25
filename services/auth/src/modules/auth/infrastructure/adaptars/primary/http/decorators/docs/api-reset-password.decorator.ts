import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { PasswordConstants } from '@auth/domain/values-objects/constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOperation,
  ApiSeeOtherResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resetar senha do usuário',
    }),
    ApiCookieAuth('cookie_reset_pass'),
    ApiSeeOtherResponse({
      description:
        'Usuário conseguiu resetar a senha e será direcionado para tela de login',
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
  );
}
