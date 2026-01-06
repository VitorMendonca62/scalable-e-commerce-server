import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiUpdatePassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar senha do usuário',
    }),
    ApiCookieAuth('cookie_access'),
    ApiOkResponse({
      description: 'A senha do usuário foi atualizada com sucesso',
      example: {
        statusCode: HttpStatus.OK,
        message: 'A senha do usuário foi atualizada!',
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description:
        'A senha antiga do usuário está diferente a armazenada ou algum campo está inválido',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'A senha atual informada está incorreta.',
        data: 'oldPassword',
      },
      type: HttpResponseOutbound,
    }),
    ApiUnauthorizedResponse({
      description: 'As credenciais estão incorretas',
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido ou expirado',
      },
      type: HttpResponseOutbound,
    }),
    ApiNotFoundResponse({
      description: 'Não foi possivel encontrar o usuário no banco de dados.',
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado.',
      },
      type: HttpResponseOutbound,
    }),
  );
}
