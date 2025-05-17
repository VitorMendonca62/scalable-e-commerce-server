import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiLoginUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar sessão de usuário',
    }),
    ApiCreatedResponse({
      description: 'Foi possivel realizar o login usuário',
    }),
    ApiBadRequestResponse({
      description:
        'Algum campo está inválido ou a senha ou email estão incorretos',
    }),
  );
}
