import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

import UseCaseResultToHttpMapper from './use-case-result-to-http.mapper';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import {
  NotPossible,
  BusinessRuleFailure,
  FieldInvalid,
  NotFoundUser,
  WrongCredentials,
} from '@auth/domain/ports/primary/http/errors.port';
import { HttpOKResponse } from '@auth/domain/ports/primary/http/sucess.port';

describe('UseCaseResultToHttpMapper', () => {
  let mapper: UseCaseResultToHttpMapper;
  let response: FastifyReply;

  beforeEach(() => {
    mapper = new UseCaseResultToHttpMapper();
    response = {
      status: vi.fn().mockReturnThis(),
    } as any;
  });

  it('should return success response and set status when result is ok', () => {
    const success = new HttpOKResponse('ok', { foo: 'bar' });
    const result = { ok: true as const };

    const output = mapper.map(result, success, response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(output).toBe(success);
    expect(output).toEqual({
      statusCode: HttpStatus.OK,
      message: 'ok',
      data: { foo: 'bar' },
    });
  });

  it('should map NOT_POSSIBLE to NotPossible and 500', () => {
    const result = {
      ok: false as const,
      reason: ApplicationResultReasons.NOT_POSSIBLE,
      message: 'Erro',
    };

    const output = mapper.map(result, new HttpOKResponse('ok'), response);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(output).toBeInstanceOf(NotPossible);
    expect(output).toEqual({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro',
      data: undefined,
    });
  });

  it('should map BUSINESS_RULE_FAILURE to BusinessRuleFailure and 400', () => {
    const result = {
      ok: false as const,
      reason: ApplicationResultReasons.BUSINESS_RULE_FAILURE,
      message: 'Regra inválida',
    };

    const output = mapper.map(result, new HttpOKResponse('ok'), response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(output).toBeInstanceOf(BusinessRuleFailure);
    expect(output).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Regra inválida',
      data: undefined,
    });
  });

  it('should map FIELD_INVALID to FieldInvalid and 400 (with data)', () => {
    const result = {
      ok: false as const,
      reason: ApplicationResultReasons.FIELD_INVALID,
      message: 'Campo inválido',
      result: { field: 'email' },
    };

    const output = mapper.map(result, new HttpOKResponse('ok'), response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(output).toBeInstanceOf(FieldInvalid);
    expect(output).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Campo inválido',
      data: { field: 'email' },
    });
  });

  it('should map WRONG_CREDENTIALS to WrongCredentials and 401 (with data)', () => {
    const result = {
      ok: false as const,
      reason: ApplicationResultReasons.WRONG_CREDENTIALS,
      message: 'Credenciais inválidas',
      result: { attempts: 3 },
    };

    const output = mapper.map(result, new HttpOKResponse('ok'), response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(output).toBeInstanceOf(WrongCredentials);
    expect(output).toEqual({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Credenciais inválidas',
      data: { attempts: 3 },
    });
  });

  it('should map NOT_FOUND to NotFoundUser and 404', () => {
    const result = {
      ok: false as const,
      reason: ApplicationResultReasons.NOT_FOUND,
      message: 'Usuário não encontrado',
    };

    const output = mapper.map(result, new HttpOKResponse('ok'), response);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(output).toBeInstanceOf(NotFoundUser);
    expect(output).toEqual({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Usuário não encontrado',
      data: undefined,
    });
  });
});
