import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { PasswordConstants } from '@auth/domain/values-objects/constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiValidateCodeForForgotPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Validar código que chegou no email para resetar senha.',
    }),
    ApiOkResponse({
      description: 'O código de recuperação foi validado com sucesso',
      example: {
        statusCode: HttpStatus.OK,
        message: 'Seu código de recuperação de senha foi validado com sucesso.',
        data: {
          reset_pass_token: '<reset_pass_token>',
        },
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description:
        'Algum campo está inválido ou código expirado ou não existe no banco de dados.',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: PasswordConstants.ERROR_REQUIRED,
        data: 'oldPassword',
      },
      type: HttpResponseOutbound,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Erro interno ao validar o código de recuperação',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      },
      type: HttpResponseOutbound,
    }),
  );
}
