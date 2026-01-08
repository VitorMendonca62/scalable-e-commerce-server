import GetCertsUseCase from '@auth/application/use-cases/get-certs-usecase';
import { Controller, Get } from '@nestjs/common';

@Controller('/certs')
export default class CertsController {
  constructor(private readonly getCertsUseCase: GetCertsUseCase) {}

  @Get('/')
  async getCerts() {
    return {
      keys: [
        await this.getCertsUseCase.getAuthCert(),
        await this.getCertsUseCase.getResetPassCert(),
      ],
    };
  }
}
