import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpResponseOutbound } from './sucess.port';

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

export class ExternalServiceException<T = unknown> extends HttpError {
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

export class FieldAlreadyExists<T = unknown> extends HttpResponseOutbound {
  constructor(message: string = 'Valor já existe de outro usuário', data: T) {
    super(HttpStatus.CONFLICT, message, data);
    this.statusCode = HttpStatus.CONFLICT;
    this.message = message;
    this.data = data;
  }
}

export class NotFoundItem<T = unknown> extends HttpResponseOutbound {
  constructor(
    message: string = 'Não foi possivel encontrar o usuário',
    data: T = undefined as T,
  ) {
    super(HttpStatus.NOT_FOUND, message, data);
    this.statusCode = HttpStatus.NOT_FOUND;
    this.message = message;
    this.data = data;
  }
}

export class BusinessRuleViolation<T = unknown> extends HttpResponseOutbound {
  constructor(
    message: string = 'Regra de negócio violada',
    data: T = undefined as T,
  ) {
    super(HttpStatus.CONFLICT, message, data);
    this.statusCode = HttpStatus.CONFLICT;
    this.message = message;
    this.data = data;
  }
}
