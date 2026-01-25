import { ApiData } from '@modules/user/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-data.decorator';
import { ApiMessage } from '@modules/user/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-message.decorator';
import { ApiStatusCode } from '@modules/user/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-status-code.decorator';
import { HttpStatus } from '@nestjs/common';

export abstract class HttpResponseOutbound<T = unknown> {
  @ApiStatusCode()
  statusCode: HttpStatus;

  @ApiMessage()
  message: string;

  @ApiData()
  data: T;

  constructor(status: HttpStatus, message: string, data: T = undefined) {
    this.statusCode = status;
    this.message = message;
    this.data = data;
  }
}

export class HttpOKResponse<T = unknown> extends HttpResponseOutbound {
  constructor(message: string = 'OK!', data: T = undefined) {
    super(HttpStatus.OK, message, data);
  }
}

export class HttpCreatedResponse<T = unknown> extends HttpResponseOutbound {
  constructor(message: string = 'Criado!', data: T = undefined) {
    super(HttpStatus.CREATED, message, data);
  }
}
