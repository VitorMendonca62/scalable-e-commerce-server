import { HttpError } from '@auth/domain/ports/primary/http/errors.port';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (
      exception instanceof HttpError ||
      exception instanceof NotFoundException
    ) {
      const exceptionResponse = exception.getResponse();
      return response.status(exception.getStatus()).json(exceptionResponse);
    }

    const responseBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro desconhecido. Contate o suporte.',
      data: new Date().toISOString(),
    };

    response.status(responseBody.statusCode).json(responseBody);
  }
}
