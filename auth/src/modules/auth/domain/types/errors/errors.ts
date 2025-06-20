import { HttpException, HttpStatus } from '@nestjs/common';

export class HttpFieldInvalid extends HttpException {
  data: string;

  constructor(message: string = 'Há um campo inválido.', field: string) {
    super(message, HttpStatus.BAD_REQUEST);
    this.data = field;
  }

  getResponse() {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      data: this.data,
      message: this.message,
    };
  }
}

export class FieldInvalid extends Error {
  statusCode: number;
  data: string;

  constructor(message: string = 'Há um campo inválido.', field: string) {
    super(message);
    this.data = field;
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}

export class WrongCredentials extends Error {
  statusCode: number;
  data: any;

  constructor(
    message: string = 'Suas credenciais estão incorretas.',
    data: any = {},
  ) {
    super(message);
    this.name = 'Credencias incorretas';
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.data = data;
  }

  getResponse() {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      data: this.data,
      message: this.message,
    };
  }
}

export class FieldlAlreadyExists extends Error {
  statusCode: number;
  data: any;

  constructor(
    message: string = 'Valor já existe de outro usuário',
    data: any = {},
  ) {
    super(message);
    this.name = 'Valor já existe de outro usuário';
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.data = data;
  }

  getResponse() {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      data: this.data,
      message: this.message,
    };
  }
}

export class TokenInvalid extends Error {
  statusCode: number;
  data: any;

  constructor(message: string = 'Você não tem permissão', data: any = {}) {
    super(message);
    this.name = 'Sem permissão';
    this.statusCode = HttpStatus.FORBIDDEN;
    this.data = data;
  }

  getResponse() {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      data: this.data,
      message: this.message,
    };
  }
}
