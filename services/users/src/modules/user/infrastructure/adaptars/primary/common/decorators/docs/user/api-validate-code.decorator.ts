import { HttpResponseOutbound } from '@user/domain/ports/primary/http/sucess.port';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Cookies } from '@user/domain/enums/cookies.enum';
import { EmailConstants } from '@user/domain/values-objects/user/constants';

export function ApiValidateCode() {
  return applyDecorators(
    ApiOperation({
      summary: 'Validar código de email',
    }),
    ApiOkResponse({
      description: 'Código validado com sucesso e token gerado',
      example: {
        statusCode: HttpStatus.OK,
        message: 'Código validado com sucesso.',
        data: {
          [Cookies.SignUpToken]: 'sign-up-token',
        },
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Erro de validação no email/código ou código inválido',
      examples: {
        invalidEmail: {
          summary: 'Email inválido',
          value: {
            statusCode: HttpStatus.BAD_REQUEST,
            data: 'email',
            message: EmailConstants.ERROR_INVALID,
          },
        },
        codeRequired: {
          summary: 'Código ausente',
          value: {
            statusCode: HttpStatus.BAD_REQUEST,
            data: 'code',
            message: 'O código de recuperação é obrigatório.',
          },
        },
        invalidCode: {
          summary: 'Código inválido ou expirado',
          value: {
            statusCode: HttpStatus.BAD_REQUEST,
            data: undefined,
            message: 'Código de validação inválido ou expirado. Tente novamente',
          },
        },
      },
      type: HttpResponseOutbound,
    }),
    ApiInternalServerErrorResponse({
      description: 'Não foi possivel validar o código de verificação',
      example: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel validar o código de verificação.',
        data: undefined,
      },
      type: HttpResponseOutbound,
    }),
  );
}
