import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import {
  NotPossible,
  BusinessRuleFailure,
  FieldInvalid,
  NotFoundUser,
  WrongCredentials,
} from '@auth/domain/ports/primary/http/errors.port';
import { HttpResponseOutbound } from '@auth/domain/ports/primary/http/sucess.port';
import { UseCaseResult } from '@auth/domain/types/use-case-result-mapper';
import { Injectable, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Injectable()
export default class UseCaseResultToHttpMapper {
  private statusForReason(reason: ApplicationResultReasons): HttpStatus {
    const statusMap: Record<ApplicationResultReasons, HttpStatus> = {
      [ApplicationResultReasons.NOT_POSSIBLE]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ApplicationResultReasons.BUSINESS_RULE_FAILURE]: HttpStatus.BAD_REQUEST,
      [ApplicationResultReasons.FIELD_INVALID]: HttpStatus.BAD_REQUEST,
      [ApplicationResultReasons.NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ApplicationResultReasons.WRONG_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
    };

    return statusMap[reason];
  }

  private errorForReason(
    reason: ApplicationResultReasons,
    message?: string,
    data?: any,
  ) {
    if (reason === ApplicationResultReasons.NOT_POSSIBLE) {
      return new NotPossible(message);
    }
    if (reason === ApplicationResultReasons.BUSINESS_RULE_FAILURE) {
      return new BusinessRuleFailure(message);
    }
    if (reason === ApplicationResultReasons.FIELD_INVALID) {
      return new FieldInvalid(message, data);
    }
    if (reason === ApplicationResultReasons.WRONG_CREDENTIALS) {
      return new WrongCredentials(message, data);
    }

    return new NotFoundUser(message);
  }

  map(
    result: UseCaseResult,
    sucessResponse: HttpResponseOutbound,
    response: FastifyReply,
  ): HttpResponseOutbound {
    if (result.ok === false) {
      response.status(this.statusForReason(result.reason));
      return this.errorForReason(result.reason, result.message, result.result);
    }

    response.status(sucessResponse.statusCode);
    return sucessResponse;
  }
}
