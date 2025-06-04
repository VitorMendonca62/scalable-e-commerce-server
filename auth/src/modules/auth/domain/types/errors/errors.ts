import { HttpException, HttpStatus } from '@nestjs/common';
import EmailVO from '../../values-objects/email.vo';

export class HttpFieldInvalid extends HttpException {
  field?: string;
  constructor(message: string = 'Há um campo inválido.', field?: string) {
    super(`${field}: ${message}`, HttpStatus.BAD_REQUEST);
    this.name = 'Campo inválido';
  }

  toJson() {
    return {
      message: this.message,
      statusCode: HttpStatus.BAD_REQUEST,
    };
  }
}

export class FieldInvalid extends Error {
  statusCode: number;
  constructor(message: string = 'Há um campo inválido.') {
    super(message);
    this.name = 'Campo inválido';
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}

export class WrongCredentials extends Error {
  statusCode: number;
  constructor(message: string = 'Suas credenciais estão incorretas.') {
    super(message);
    this.name = 'Credencias incorretas';
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}

export class FieldlAlreadyExists extends Error {
  statusCode: number;
  constructor(message: string = EmailVO.ERROR_ALREADY_EXISTS) {
    super(message);
    this.name = 'Valor já existe de outro usuário';
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}

export class TokenInvalid extends Error {
  statusCode: number;
  constructor(message: string = 'Você não tem permissão') {
    super(message);
    this.name = 'Sem permissão';
    this.statusCode = HttpStatus.FORBIDDEN;
  }
}
