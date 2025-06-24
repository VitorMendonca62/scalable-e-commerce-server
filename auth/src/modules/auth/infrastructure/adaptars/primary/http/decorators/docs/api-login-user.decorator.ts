import { HttpCreatedResponse } from '@modules/auth/domain/ports/primary/http/sucess.port';
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
      type: HttpCreatedResponse,
    }),
    ApiBadRequestResponse({
      description:
        'Algum campo está inválido ou a senha ou email estão incorretos',
    }),
    ApiBadRequestResponse({
      description: 'Erro de validação ou usuário já existente',
      content: {
        'application/json': {
          examples: {
            ValidationError: {
              summary: 'Erro de validação',
              value: {
                statusCode: 400,
                data: 'email',
                message: 'O email deve ser válido',
              },
            },
            UserAlreadyExists: {
              summary: 'Usuário já existe',
              value: {
                statusCode: 400,
                data: 'email',
                message: 'Esse email já está sendo utilizado. Tente outro',
              },
            },
          },
        },
      },
    }),
  );
}
