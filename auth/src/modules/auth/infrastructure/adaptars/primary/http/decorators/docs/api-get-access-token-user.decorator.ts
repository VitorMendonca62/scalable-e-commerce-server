import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiGetAccessToken() {
  return applyDecorators(
    ApiOperation({
      summary: 'Pegar token de acesso para acessar a API',
    }),
    ApiBearerAuth('refresh_token'),
    ApiHeader({
      name: 'authorization',
      example: 'Bearer <refresh_token>',
      description: 'Token para ter acesso a rotas seguras',
    }),
    ApiOkResponse({
      description: 'Retorna o novo token de acesso',
      example: {
        statusCode: HttpStatus.OK,
        message: 'Aqui está seu token de acesso',
        data: 'Bearer <access_token>',
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description:
        'O RefreshToken não foi passado ou foi passado de uma inválida',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: 'refresh_token',
        message: 'Você não tem permissão',
      },
      type: HttpResponseOutbound,
    }),
    ApiUnauthorizedResponse({
      description: 'RefreshToken expirado ou inválido',
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido ou expirado',
      },
      type: HttpResponseOutbound,
    }),
  );
}
