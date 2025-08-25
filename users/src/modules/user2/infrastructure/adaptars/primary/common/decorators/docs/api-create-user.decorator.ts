import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar usuário',
    }),
    ApiCreatedResponse({
      description: 'Foi possivel criar usuário',
    }),
    ApiBadRequestResponse({
      description:
        'Algum campo está inválido ou o sistema encontrou outro usuário com o mesmo username ou email',
    }),
  );
}
