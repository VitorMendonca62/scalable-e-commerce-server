import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Realizar o logou do usuário, revogando seu token.',
    }),
    ApiNoContentResponse({
      description: 'O logout teve sucesso.',
    }),
  );
}
