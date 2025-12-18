import { HttpException, HttpStatus } from '@nestjs/common';

class HttpError extends HttpException {
  data: any;
  statusCode: number;

  constructor(
    message: string = 'Algo de errado aconteceu!',
    status: number = HttpStatus.BAD_REQUEST,
    data: any = undefined,
  ) {
    super(message, status);
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

export class BusinessRuleFailure extends HttpError {
  constructor(message: string = 'Regra de negócio quebrada.', data: any = {}) {
    super(message, HttpStatus.BAD_REQUEST, data);
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
    this.data = data;
  }
}

export class WrongCredentials extends HttpError {
  constructor(
    message: string = 'Suas credenciais estão incorretas. Tente novamente',
    data: any = {},
  ) {
    super(message, HttpStatus.UNAUTHORIZED, data);
    this.statusCode = HttpStatus.UNAUTHORIZED;
    this.message = message;
    this.data = data;
  }
}

export class NotFoundUser extends HttpError {
  constructor(message: string = 'Usuário não encontrado.', data: any = {}) {
    super(message, HttpStatus.NOT_FOUND, data);
    this.statusCode = HttpStatus.NOT_FOUND;
    this.message = message;
    this.data = data;
  }
}

export class ExternalServiceError extends HttpError {
  constructor(
    message: string = 'Erro ao comunicar com serviço externo',
    data: any = {},
  ) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, data);
    this.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
    this.message = message;
    this.data = data;
  }
}
