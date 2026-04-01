import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiGoogleCallback() {
  return applyDecorators(
    ApiOperation({
      summary: 'Finalizar autenticacao via Google OAuth',
    }),
    ApiQuery({
      name: 'code',
      required: true,
      description: 'Codigo de autorizacao retornado pelo Google',
      example: '4/0AbUR2V...abc123',
    }),
    ApiQuery({
      name: 'state',
      required: false,
      description: 'Parametro opcional de state usado no fluxo OAuth',
      example: 'csrf_token',
    }),
    ApiCreatedResponse({
      description: 'Usuario autenticado via Google com sucesso',
      example: {
        statusCode: HttpStatus.CREATED,
        message: 'Usuário realizou login com sucesso',
        data: {
          refresh_token: '<refresh_token>',
          access_token: '<access_token>',
        },
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Codigo de autorizacao invalido ou ausente',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Codigo de autorizacao invalido',
      },
      type: HttpResponseOutbound,
    }),
    ApiUnauthorizedResponse({
      description: 'Falha na autenticacao com o provedor',
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido ou expirado',
      },
      type: HttpResponseOutbound,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Erro interno ao autenticar com o Google',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro inesperado. Tente novamente mais tarde.',
      },
      type: HttpResponseOutbound,
    }),
  );
}
