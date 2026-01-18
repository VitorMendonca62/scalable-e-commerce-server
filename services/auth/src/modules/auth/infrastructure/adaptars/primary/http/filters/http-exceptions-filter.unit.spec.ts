import {
  ArgumentsHost,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exceptions-filter';
vi.mock('@auth/domain/ports/primary/http/errors.port');
import { HttpError } from '@auth/domain/ports/primary/http/errors.port';
import { type Mocked } from 'vitest';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    filter = new HttpExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    const switchToHttpMock = vi.fn();
    const getResponseMock = vi.fn();
    const statusMock = vi.fn();
    const jsonMock = vi.fn();

    let host: ArgumentsHost;

    beforeEach(() => {
      host = { switchToHttp: switchToHttpMock } as any;
      statusMock.mockReturnValue({ json: jsonMock });
      getResponseMock.mockReturnValue({ status: statusMock });
      switchToHttpMock.mockReturnValue({ getResponse: getResponseMock });

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));
    });

    it('should call hosts functions', async () => {
      filter.catch(new Error('Error'), host);

      expect(switchToHttpMock).toHaveBeenCalled();
      expect(getResponseMock).toHaveBeenCalled();
    });

    it('should return same exception when exception instance of HttpError', async () => {
      const response = { foo: 'bar' };
      const status = HttpStatus.OK;
      const error = new HttpError(
        'Error',
        status,
        response,
      ) as Mocked<HttpError>;

      error.getResponse.mockReturnValue(response);
      error.getStatus.mockReturnValue(status);

      filter.catch(error, host);

      expect(error.getResponse).toHaveBeenCalled();
      expect(error.getStatus).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(status);
      expect(jsonMock).toHaveBeenCalledWith(response);
    });

    it('should return same exception when exception instance of NotFoundException', async () => {
      const status = HttpStatus.NOT_FOUND;
      const response = {
        message: 'Cannot GET /',
        error: 'Not Found',
        statusCode: status,
      };

      const error = new NotFoundException('Error') as Mocked<NotFoundException>;

      vi.spyOn(error, 'getResponse').mockReturnValue(response);
      vi.spyOn(error, 'getStatus').mockReturnValue(status);

      filter.catch(error, host);

      expect(error.getResponse).toHaveBeenCalled();
      expect(error.getStatus).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(status);
      expect(jsonMock).toHaveBeenCalledWith(response);
    });

    it('should return same exception when exception instance of UnauthorizedException', async () => {
      const status = HttpStatus.UNAUTHORIZED;
      const response = {
        message: 'Cannot GET /',
        error: 'Not Found',
        statusCode: status,
      };

      const error = new UnauthorizedException(
        'Error',
      ) as Mocked<UnauthorizedException>;

      vi.spyOn(error, 'getResponse').mockReturnValue(response);
      vi.spyOn(error, 'getStatus').mockReturnValue(status);

      filter.catch(error, host);

      expect(error.getResponse).toHaveBeenCalled();
      expect(error.getStatus).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(status);
      expect(jsonMock).toHaveBeenCalledWith(response);
    });

    it('should return internal server error with timestamp', async () => {
      filter.catch(new Error('Error'), host);
      const body = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro desconhecido. Contate o suporte.',
        data: new Date().toISOString(),
      };

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith(body);
    });
  });
});
