import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Realizar o logou do usuário, revogando seu token.',
    }),
    ApiCookieAuth('cookie_refresh'),
    ApiNoContentResponse({
      description: 'O logout teve sucesso.',
    }),
  );
}
