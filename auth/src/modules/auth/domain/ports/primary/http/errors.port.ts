import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpResponseOutbound } from './sucess.port';
import { ApiData } from '@modules/auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-data.decorator';
import { ApiMessage } from '@modules/auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-message.decorator';
import { ApiStatusCode } from '@modules/auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-status-code.decorator';

class HttpError extends HttpException {
  data: any;
  statusCode: number;

  constructor(
    message: string = 'Algo de errado aconteceu!',
    status: number,
    data: any = undefined,
  ) {
    super(message, HttpStatus.BAD_REQUEST);
    this.data = data;
    this.statusCode = status;
  }

  getResponse(): HttpResponseOutbound {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
    };
  }
}

export class FieldInvalid extends HttpError {
  @ApiStatusCode(HttpStatus.BAD_REQUEST)
  statusCode: number;

  @ApiMessage('Há um campo inválido.')
  message: string;

  @ApiData('email')
  data: any;

  constructor(message: string = 'Há um campo inválido.', field: string) {
    super(message, HttpStatus.BAD_REQUEST, field);
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
    this.data = field;
  }
}

export class WrongCredentials extends HttpError {
  @ApiStatusCode(HttpStatus.BAD_REQUEST)
  statusCode: number;

  @ApiMessage('Suas credenciais estão incorretas.')
  message: string;

  @ApiData({})
  data: any;

  constructor(
    message: string = 'Suas credenciais estão incorretas.',
    data: any = {},
  ) {
    super(message, HttpStatus.BAD_REQUEST, data);
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
    this.data = data;
  }
}

export class FieldAlreadyExists extends HttpError {
  @ApiStatusCode(HttpStatus.BAD_REQUEST)
  statusCode: number;

  @ApiMessage('Valor já existe de outro usuário')
  message: string;

  @ApiData('username')
  data: any;

  constructor(
    message: string = 'Valor já existe de outro usuário',
    data: string,
  ) {
    super(message, HttpStatus.BAD_REQUEST, data);
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
    this.data = data;
  }
}

export class TokenInvalid extends HttpError {
  @ApiStatusCode(HttpStatus.FORBIDDEN)
  statusCode: number;

  @ApiMessage('Você não tem permissão')
  message: string;

  @ApiData({})
  data: any;

  constructor(message: string = 'Você não tem permissão', data: any = {}) {
    super(message, HttpStatus.FORBIDDEN, data);
    this.statusCode = HttpStatus.FORBIDDEN;
    this.message = message;
    this.data = data;
  }
}
