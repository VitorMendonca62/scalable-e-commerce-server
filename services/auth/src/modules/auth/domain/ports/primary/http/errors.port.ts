import { HttpException, HttpStatus } from '@nestjs/common';

export class HttpError<T = unknown> extends HttpException {
  data: T;
  statusCode: number;

  constructor(
    message: string = 'Algo de errado aconteceu!',
    status: number = HttpStatus.BAD_REQUEST,
    data: T = undefined as T,
  ) {
    super({ message, data, statusCode: status }, status);
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

export class BusinessRuleFailure<T = unknown> extends HttpError {
  constructor(
    message: string = 'Regra de negócio quebrada.',
    data: T = undefined as T,
  ) {
    super(message, HttpStatus.BAD_REQUEST, data);
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
    this.data = data;
  }
}

export class WrongCredentials<T = unknown> extends HttpError {
  constructor(
    message: string = 'Suas credenciais estão incorretas. Tente novamente',
    data: T = undefined as T,
  ) {
    super(message, HttpStatus.UNAUTHORIZED, data);
    this.statusCode = HttpStatus.UNAUTHORIZED;
    this.message = message;
    this.data = data;
  }
}

export class NotFoundUser<T = unknown> extends HttpError {
  constructor(
    message: string = 'Usuário não encontrado.',
    data: T = undefined as T,
  ) {
    super(message, HttpStatus.NOT_FOUND, data);
    this.statusCode = HttpStatus.NOT_FOUND;
    this.message = message;
    this.data = data;
  }
}

export class Conflit<T = unknown> extends HttpError {
  constructor(
    message: string = 'Houve conflitos por motivos desconhecidos.',
    data: T = undefined as T,
  ) {
    super(message, HttpStatus.CONFLICT, data);
    this.statusCode = HttpStatus.CONFLICT;
    this.message = message;
    this.data = data;
  }
}

export class ExternalServiceError<T = unknown> extends HttpError {
  constructor(
    message: string = 'Erro ao comunicar com serviço externo',
    data: T = undefined as T,
  ) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, data);
    this.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
    this.message = message;
    this.data = data;
  }
}
