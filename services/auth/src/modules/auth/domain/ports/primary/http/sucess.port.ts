import { ApiData } from '@auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-data.decorator';
import { ApiMessage } from '@auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-message.decorator';
import { ApiStatusCode } from '@auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-status-code.decorator';
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

export class HttpNoContentResponse extends HttpResponseOutbound {
  constructor() {
    super(HttpStatus.NO_CONTENT, undefined, undefined);
  }
}

export class HttpAcceptedResponse<T = unknown> extends HttpResponseOutbound {
  constructor(message: string = 'Accepted!', data: T = undefined) {
    super(HttpStatus.ACCEPTED, message, data);
  }
}

export class HttpCreatedResponse<T = unknown> extends HttpResponseOutbound {
  constructor(message: string = 'Criado!', data: T = undefined) {
    super(HttpStatus.CREATED, message, data);
  }
}
export class HttpRedirectSeeOrtherResponse<
  T = unknown,
> extends HttpResponseOutbound {
  constructor(message: string = 'Redirecionado!', data: T = undefined) {
    super(HttpStatus.SEE_OTHER, message, data);
  }
}
