import {
  FieldInvalid,
  FieldAlreadyExists,
} from '@modules/auth/domain/ports/primary/http/errors.port';
import { HttpCreatedResponse } from '@modules/auth/domain/ports/primary/http/sucess.port';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';

export function ApiCreateUser() {
  return applyDecorators(
    ApiExtraModels(FieldInvalid, FieldAlreadyExists),
    ApiOperation({
      summary: 'Criar usuário',
    }),
    ApiCreatedResponse({
      description: 'Foi possivel criar usuário',
      example: {
        statusCode: 201,
        message: 'Usuário criado com sucesso',
        data: undefined,
      },
      type: HttpCreatedResponse,
    }),
    ApiBadRequestResponse({
      description: 'Erro de validação ou usuário já existente',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            oneOf: [
              { $ref: getSchemaPath(FieldInvalid) },
              { $ref: getSchemaPath(FieldAlreadyExists) },
            ],
          },
          examples: {
            ValidationError: {
              summary: 'Erro de validação',
              description: 'Ocorreu um erro de validação no campo informado',
              value: {
                statusCode: 400,
                data: 'email',
                message: 'O email deve ser válido',
              },
            },
            UserAlreadyExists: {
              summary: 'Usuário já existe',
              description: 'O campo informado já está em uso por outro usuário',
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
