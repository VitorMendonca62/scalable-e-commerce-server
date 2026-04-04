import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { StreetConstants } from '@user/domain/values-objects/address/constants';

export function ApiAddUserAddress() {
  return applyDecorators(
    ApiOperation({
      summary: 'Adicionar endereço do usuário',
    }),
    ApiHeader({
      name: 'x-user-id',
      description: 'ID do usuário autenticado para adicionar endereço.',
      required: true,
    }),
    ApiCreatedResponse({
      description: 'Endereço criado com sucesso',
      example: {
        statusCode: HttpStatus.CREATED,
        message: 'Endereço criado com sucesso',        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Erro de validação em algum campo ou regra de negócio',
      examples: {
        invalidField: {
          summary: 'Campo inválido',
          value: {
            statusCode: HttpStatus.BAD_REQUEST,
            data: 'street',
            message: StreetConstants.ERROR_REQUIRED,
          },
        },
        maxAddresses: {
          summary: 'Limite de endereços atingido',
          value: {
            statusCode: HttpStatus.BAD_REQUEST,
            data: undefined,
            message:
              'O usuário já possui o número máximo de endereços permitidos (3).',
          },
        },
      },
      type: HttpResponseOutbound,
    }),
    ApiInternalServerErrorResponse({
      description: 'Não foi possivel adicionar o endereço',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel adicionar o endereço',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
  );
}
