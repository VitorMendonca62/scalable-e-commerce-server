import { HttpException, HttpStatus } from '@nestjs/common';

interface IResponse {
  statusCode: HttpStatus;
  data: any;
  message: string;
}

class HttpError extends HttpException {
  data: any;
  statusCode: number;

  getResponse(): IResponse {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
    };
  }
}

export class HttpFieldInvalid extends HttpError {
  data: string;
  statusCode: number;

  constructor(message: string = 'Há um campo inválido.', field: string) {
    super(message, HttpStatus.BAD_REQUEST);
    this.data = field;
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}

export class WrongCredentials extends HttpError {
  data: any;
  statusCode: number;

  constructor(
    message: string = 'Suas credenciais estão incorretas.',
    data: any = {},
  ) {
    super(message, HttpStatus.BAD_REQUEST);
    this.data = data;
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}

export class FieldlAlreadyExists extends HttpError {
  data: any;
  statusCode: number;

  constructor(
    message: string = 'Valor já existe de outro usuário',
    data: string,
  ) {
    super(message, HttpStatus.BAD_REQUEST);
    this.data = data;
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}

export class TokenInvalid extends HttpError {
  statusCode: number;
  data: any;

  constructor(message: string = 'Você não tem permissão', data: any = {}) {
    super(message, HttpStatus.FORBIDDEN);
    this.name = 'Sem permissão';
    this.statusCode = HttpStatus.FORBIDDEN;
    this.data = data;
  }
}
