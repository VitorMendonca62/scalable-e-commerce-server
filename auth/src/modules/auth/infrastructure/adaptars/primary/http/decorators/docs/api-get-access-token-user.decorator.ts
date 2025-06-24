import { HttpOKResponse } from '@modules/auth/domain/ports/primary/http/sucess.port';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiGetAccessToken() {
  return applyDecorators(
    ApiOperation({
      summary: 'Pegar token de acesso para acessar a API',
    }),
    ApiOkResponse({
      description: 'Retorna o novo token de acesso',
      type: HttpOKResponse,
    }),
    ApiBadRequestResponse({
      description: 'O token está expirado ou é inválido',
    }),
    ApiForbiddenResponse({
      description:
        'O refreshtoken não foi passado ou foi passado de uma forma errada',
    }),
  );
}
