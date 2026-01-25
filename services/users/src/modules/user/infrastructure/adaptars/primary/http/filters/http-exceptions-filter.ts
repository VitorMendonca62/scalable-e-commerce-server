import { HttpError } from '@modules/user/domain/ports/primary/http/error.port';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpError) {
      const exceptionResponse = exception.getResponse();
      return response.status(exception.getStatus()).send(exceptionResponse);
    }

    const responseBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro desconhecido. Contate o suporte.',
      data: new Date().toISOString(),
    };

    response.status(responseBody.statusCode).send(responseBody);
  }
}
