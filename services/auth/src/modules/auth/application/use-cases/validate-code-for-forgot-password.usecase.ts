import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { Injectable } from '@nestjs/common';
import {
  ValidateCodeForForgotPasswordPort,
  ExecuteReturn,
} from '@auth/domain/ports/application/validate-code-for-forgot-password.port';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';

@Injectable()
export default class ValidateCodeForForgotPasswordUseCase implements ValidateCodeForForgotPasswordPort {
  constructor(
    private readonly emailCodeRepository: EmailCodeRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(code: string, email: string): Promise<ExecuteReturn> {
    const emailCode = await this.emailCodeRepository.findOne({ code, email });

    if (emailCode === undefined || emailCode === null)
      return {
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        message: 'Código de recuperação inválido ou expirado. Tente novamente',
      };

    if (emailCode.expiresIn < new Date())
      return {
        ok: false,
        reason: ApplicationResultReasons.FIELD_INVALID,
        message: 'Código de recuperação inválido ou expirado. Tente novamente',
      };

    await this.emailCodeRepository.deleteMany(email);

    return {
      ok: true,
      result: this.tokenService.generateResetPassToken({ email }),
    };
  }
}
