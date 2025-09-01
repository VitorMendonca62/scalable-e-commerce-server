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

export class NotFoundItem extends HttpError {
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

export class BusinessRuleViolation extends HttpError {
  constructor(
    message: string = 'Regra de negócio violada',
    data: any = {},
  ) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, data);
    this.statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    this.message = message;
    this.data = data;
  }
}