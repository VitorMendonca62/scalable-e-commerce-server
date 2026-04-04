import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function ApiDeleteUserAddress() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deletar um endereço do usuário',
    }),
    ApiHeader({
      name: 'x-user-id',
      description: 'ID do usuário autenticado para excluir endereço.',
      required: true,
    }),
    ApiParam({
      name: 'addressId',
      description: 'ID do endereço a ser removido.',
      example: 1,
      required: true,
    }),
    ApiOkResponse({
      description: 'Endereço deletado com sucesso',
      example: {
        statusCode: HttpStatus.OK,
        message: 'Endereço deletado com sucesso',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
    ApiNotFoundResponse({
      description: 'Não foi possivel encontrar o endereço',
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Não foi possivel encontrar o endereço',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
    ApiInternalServerErrorResponse({
      description: 'Não foi possivel deletar o endereço',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel deletar o endereço',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
  );
}
