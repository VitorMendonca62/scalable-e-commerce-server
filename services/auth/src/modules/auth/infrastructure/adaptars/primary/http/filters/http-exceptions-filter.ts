import { HttpError } from '@auth/domain/ports/primary/http/errors.port';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    console.error(exception)
    if (
      exception instanceof HttpError ||
      exception instanceof UnauthorizedException ||
      exception instanceof NotFoundException
    ) {
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
