import { HttpStatus } from '@nestjs/common';
import { ApplicationResultReasons } from '../enums/application-result-reasons';
import { HttpResponseOutbound } from '../ports/primary/http/sucess.port';

export interface UseCaseResultSucess {
  message?: string;
  ok: true;
  result?: unknown;
}

export interface UseCaseResultError {
  message?: string;
  ok: false;
  result?: unknown;
  reason: ApplicationResultReasons;
}

export type UseCaseResult = UseCaseResultSucess | UseCaseResultError;

interface StatusMapValue {
  status: HttpStatus;
  response: HttpResponseOutbound;
}

export type StatusMap = Record<ApplicationResultReasons, StatusMapValue>;
