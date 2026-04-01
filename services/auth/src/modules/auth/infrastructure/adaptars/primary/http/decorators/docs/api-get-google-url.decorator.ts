import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetGoogleUrl() {
  return applyDecorators(
    ApiOperation({
      summary: 'Gerar URL de autenticacao do Google OAuth',
    }),
    ApiOkResponse({
      description: 'Retorna a URL do Google para iniciar o OAuth',
      schema: {
        type: 'string',
        example:
          'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=https://app.example.com/auth/google/callback&scope=email%20profile&client_id=123456',
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Erro interno ao gerar a URL do Google OAuth',
      schema: {
        type: 'string',
        example: 'Erro inesperado. Tente novamente mais tarde.',
      },
    }),
  );
}
