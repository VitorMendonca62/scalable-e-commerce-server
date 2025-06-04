import { HttpStatus } from '@nestjs/common';

export abstract class HttpResponse {
  status: number;
  name: string;
  message: string;
  data: any;

  constructor(
    status: number,
    name: string,
    message: string,
    data: any = undefined,
  ) {
    this.status = status;
    this.name = name;
    this.message = message;
    this.data = data;
  }
}
export class HttpOKResponse extends HttpResponse {
  constructor(message: string = 'OK!', data: any = undefined) {
    super(HttpStatus.OK, 'OK', message, data);
  }
}

export class HttpCreatedResponse extends HttpResponse {
  constructor(message: string = 'Criado!', data: any = undefined) {
    super(HttpStatus.CREATED, 'Created', message, data);
  }
}
