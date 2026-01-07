import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiLoginUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar sessão de usuário',
    }),
    ApiCreatedResponse({
      description: 'Foi possivel realizar o login usuário',
      example: {
        statusCode: 201,
        message: 'Usuário realizou login com sucesso',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Algum campo está inválido',
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        data: 'email',
        message: 'O email deve ser válido',
      },
      type: HttpResponseOutbound,
    }),
    ApiUnauthorizedResponse({
      description: 'As credenciais estão incorretas',
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      },
      type: HttpResponseOutbound,
    }),
  );
}
