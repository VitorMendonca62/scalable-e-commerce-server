import { HttpException, HttpStatus } from '@nestjs/common';

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
}

export class FieldInvalid extends HttpError {
  constructor(message: string = 'Há um campo inválido.', field: string) {
    super(message, HttpStatus.BAD_REQUEST, field);
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
    this.data = field;
  }
}

export class WrongCredentials extends HttpError {
  constructor(
    message: string = 'Token ausente ou inválido!',
    data: any = {},
  ) {
    super(message, HttpStatus.UNAUTHORIZED, data);
    this.statusCode = HttpStatus.UNAUTHORIZED;
    this.message = message;
    this.data = data;
  }
}

export class FieldAlreadyExists extends HttpError {
  constructor(
    message: string = 'Valor já existe de outro usuário',
    data: string,
  ) {
    super(message, HttpStatus.CONFLICT, data);
    this.statusCode = HttpStatus.CONFLICT;
    this.message = message;
    this.data = data;
  }
}

export class NotFoundUser extends HttpError {
  constructor(
    message: string = 'Não foi possivel encontrar o usuário',
    data: any = {},
  ) {
    super(message, HttpStatus.NOT_FOUND, data);
    this.statusCode = HttpStatus.NOT_FOUND;
    this.message = message;
    this.data = data;
  }
}
