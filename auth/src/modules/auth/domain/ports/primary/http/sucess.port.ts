import { ApiData } from '@auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-data.decorator';
import { ApiMessage } from '@auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-message.decorator';
import { ApiStatusCode } from '@auth/infrastructure/adaptars/primary/http/decorators/docs/dtos/api-status-code.decorator';
import { HttpStatus } from '@nestjs/common';

export abstract class HttpResponseOutbound {
  @ApiStatusCode()
  statusCode: number;

  @ApiMessage()
  message: string;

  @ApiData()
  data: object | string | undefined;

  constructor(
    status: number,
    message: string,
    data: object | string | undefined = undefined,
  ) {
    this.statusCode = status;
    this.message = message;
    this.data = data;
  }
}
export class HttpOKResponse extends HttpResponseOutbound {
  constructor(
    message: string = 'OK!',
    data: object | string | undefined = undefined,
  ) {
    super(HttpStatus.OK, message, data);
  }
}

export class HttpNoContentResponse extends HttpResponseOutbound {
  constructor() {
    super(HttpStatus.NO_CONTENT, undefined, undefined);
  }
}

export class HttpAcceptedResponse extends HttpResponseOutbound {
  constructor(
    message: string = 'Accepted!',
    data: object | string | undefined = undefined,
  ) {
    super(HttpStatus.ACCEPTED, message, data);
  }
}

export class HttpCreatedResponse extends HttpResponseOutbound {
  constructor(
    message: string = 'Criado!',
    data: object | string | undefined = undefined,
  ) {
    super(HttpStatus.CREATED, message, data);
  }
}
export class HttpRedirectSeeOrtherResponse extends HttpResponseOutbound {
  constructor(
    message: string = 'Redirecionado!',
    data: object | string | undefined = undefined,
  ) {
    super(HttpStatus.SEE_OTHER, message, data);
  }
}
