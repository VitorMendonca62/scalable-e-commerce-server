import { HttpCreatedResponse } from '@modules/auth/domain/ports/primary/http/sucess.port';
import { applyDecorators /* HttpStatus */ } from '@nestjs/common';
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
      type: HttpCreatedResponse,
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
