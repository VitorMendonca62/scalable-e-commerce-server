import GetCertsUseCase from '@auth/application/use-cases/get-certs.usecase';
import { NotPossible } from '@auth/domain/ports/primary/http/errors.port';
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Controller('/certs')
export default class CertsController {
  constructor(private readonly getCertsUseCase: GetCertsUseCase) {}

  @Get('/')
  async getCerts(@Res({ passthrough: true }) response: FastifyReply) {
    const authCertResult = await this.getCertsUseCase.getAuthCert();

    if (authCertResult.ok === false) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(authCertResult.message);
    }

    const resetPassCertResult = await this.getCertsUseCase.getResetPassCert();

    if (resetPassCertResult.ok === false) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(resetPassCertResult.message);
    }

    return {
      keys: [authCertResult.result, resetPassCertResult.result],
    };
  }
}
