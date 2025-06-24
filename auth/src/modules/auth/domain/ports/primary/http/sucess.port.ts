import { ApiData } from '@modules/auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-data.decorator';
import { ApiMessage } from '@modules/auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-message.decorator';
import { ApiStatusCode } from '@modules/auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-status-code.decorator';
import { HttpStatus } from '@nestjs/common';

export abstract class HttpResponseOutbound {
  @ApiStatusCode()
  statusCode: number;

  @ApiMessage()
  message: string;

  @ApiData()
  data: any;

  constructor(status: number, message: string, data: any = undefined) {
    this.statusCode = status;
    this.message = message;
    this.data = data;
  }
}
export class HttpOKResponse extends HttpResponseOutbound {
  constructor(message: string = 'OK!', data: any = undefined) {
    super(HttpStatus.OK, message, data);
  }
}

export class HttpCreatedResponse extends HttpResponseOutbound {
  constructor(message: string = 'Criado!', data: any = undefined) {
    super(HttpStatus.CREATED, message, data);
  }
}
