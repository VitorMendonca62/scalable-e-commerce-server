import { HttpResponseOutbound } from '@modules/user2/domain/ports/primary/http/sucess.port';
import { AvatarConstants } from '@modules/user2/domain/values-objects/user/avatar/avatar-constants';
import { EmailConstants } from '@modules/user2/domain/values-objects/user/email/email-constants';
import { NameConstants } from '@modules/user2/domain/values-objects/user/name/name-constants';
import { PhoneNumberConstants } from '@modules/user2/domain/values-objects/user/phone-number/phone-number-constants';
import { UsernameConstants } from '@modules/user2/domain/values-objects/user/username/username-constants';
import { IDConstants } from '@modules/user2/domain/values-objects/uuid/id-constants';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar um usuário por id',
    }),
    ApiParam({
      description: IDConstants.DESCRIPTION,
      example: IDConstants.EXEMPLE,
      name: 'id',
      required: true,
      allowEmptyValue: false,
    }),
    ApiOkResponse({
      description: 'Foi possivel atualizar usuário',
      example: {
        statusCode: HttpStatus.OK,
        data: {
          name: NameConstants.EXEMPLE,
          username: UsernameConstants.EXEMPLE,
          email: EmailConstants.EXEMPLE,
          avatar: AvatarConstants.EXEMPLE,
          phonenumber: PhoneNumberConstants.EXEMPLE,
        },
        message: 'Usuário atualizado com sucesso',
      },
      type: HttpResponseOutbound,
    }),
    ApiBadRequestResponse({
      description: 'Não passou nenhum campo para o usuário ser atualizado',
      example: {
        statusCode: HttpStatus.OK,
        data: 'all',
        message: 'Adicione algum campo para o usuário ser atualizado',
      },
      type: HttpResponseOutbound,
    }),
    ApiNotFoundResponse({
      description: 'Não foi possivel encontrar o usuário',

      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Não foi possivel encontrar o usuário',
      },
      type: HttpResponseOutbound,
    }),
  );
}
