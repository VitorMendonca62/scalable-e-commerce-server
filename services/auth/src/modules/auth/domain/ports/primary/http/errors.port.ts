import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpResponseOutbound } from './sucess.port';

export class FieldInvalid extends HttpResponseOutbound {
  constructor(message: string = 'Há um campo inválido.', field: string) {
    super(HttpStatus.BAD_REQUEST, message, field);
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
    this.data = field;
  }
}

export class BusinessRuleFailure<T = unknown> extends HttpResponseOutbound {
  constructor(
    message: string = 'Regra de negócio quebrada.',
    data: T = undefined as T,
  ) {
    super(HttpStatus.BAD_REQUEST, message, data);
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.message = message;
    this.data = data;
  }
}

export class WrongCredentials<T = unknown> extends HttpResponseOutbound {
  constructor(
    message: string = 'Suas credenciais estão incorretas. Tente novamente',
    data: T = undefined as T,
  ) {
    super(HttpStatus.UNAUTHORIZED, message, data);
    this.statusCode = HttpStatus.UNAUTHORIZED;
    this.message = message;
    this.data = data;
  }
}

export class NotFoundUser<T = unknown> extends HttpResponseOutbound {
  constructor(
    message: string = 'Usuário não encontrado.',
    data: T = undefined as T,
  ) {
    super(HttpStatus.NOT_FOUND, message, data);
    this.statusCode = HttpStatus.NOT_FOUND;
    this.message = message;
    this.data = data;
  }
}

export class Conflit<T = unknown> extends HttpResponseOutbound {
  constructor(
    message: string = 'Houve conflitos por motivos desconhecidos.',
    data: T = undefined as T,
  ) {
    super(HttpStatus.CONFLICT, message, data);
    this.statusCode = HttpStatus.CONFLICT;
    this.message = message;
    this.data = data;
  }
}

export class HttpError<T = unknown> extends HttpException {
  data: T;
  statusCode: HttpStatus;

  constructor(
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    message: string = 'Algo de errado aconteceu!',
    data: T = undefined as T,
  ) {
    super({ message, data, statusCode: status }, status);
    this.data = data;
    this.statusCode = status;
  }
}

export class ExternalServiceError<T = unknown> extends HttpError {
  constructor(
    message: string = 'Erro ao comunicar com serviço externo',
    data: T = undefined as T,
  ) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message, data);
    this.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
    this.message = message;
    this.data = data;
  }
}

export class InvalidToken<T = unknown> extends HttpError {
  constructor(
    message: string = 'Suas credenciais estão incorretas. Tente novamente',
    data: T = undefined as T,
  ) {
    super(HttpStatus.UNAUTHORIZED, message, data);
    this.statusCode = HttpStatus.UNAUTHORIZED;
    this.message = message;
    this.data = data;
  }
}
