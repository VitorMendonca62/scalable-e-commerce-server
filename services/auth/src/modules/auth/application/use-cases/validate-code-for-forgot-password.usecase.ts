import { BusinessRuleFailure } from '@auth/domain/ports/primary/http/errors.port';
import EmailCodeRepository from '@auth/domain/ports/secondary/email-code-repository.port';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class ValidateCodeForForgotPasswordUseCase {
  constructor(
    private readonly emailCodeRepository: EmailCodeRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(code: string, email: string): Promise<string> {
    const emailCode = await this.emailCodeRepository.findOne({ code, email });

    if (emailCode === undefined || emailCode === null)
      throw new BusinessRuleFailure(
        'Código de recuperação inválido ou expirado. Tente novamente',
      );

    if (emailCode.expiresIn < new Date())
      throw new BusinessRuleFailure(
        'Código de recuperação inválido ou expirado. Tente novamente',
      );

    await this.emailCodeRepository.deleteMany(email);

    return this.tokenService.generateResetPassToken({ email });
  }
}
